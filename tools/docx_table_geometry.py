"""Small, repository-local helpers for deterministic DOCX table sizing.

The functions operate in WordprocessingML twips (DXA units). Keeping them in the
repository makes ``build_evaluation_documents.py`` portable across ordinary
Python environments rather than depending on a machine-specific helper path.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence

from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Twips

_EMU_PER_TWIP = 635


def _set_width(element, width_dxa: int) -> None:
    element.set(qn("w:type"), "dxa")
    element.set(qn("w:w"), str(width_dxa))


def _find_or_append(parent, tag: str):
    element = parent.find(qn(tag))
    if element is None:
        element = OxmlElement(tag)
        parent.append(element)
    return element


def section_content_width_dxa(section) -> int:
    """Return the writable page width, excluding left and right margins."""
    width_emu = (
        int(section.page_width)
        - int(section.left_margin)
        - int(section.right_margin)
    )
    width_dxa = round(width_emu / _EMU_PER_TWIP)
    if width_dxa <= 0:
        raise ValueError("Section content width must be positive.")
    return width_dxa


def column_widths_from_weights(
    weights: Sequence[float],
    total_width_dxa: int,
) -> list[int]:
    """Distribute an exact table width across positive relative weights."""
    if not weights:
        raise ValueError("At least one column weight is required.")
    if total_width_dxa <= 0:
        raise ValueError("Table width must be positive.")
    if any(weight <= 0 for weight in weights):
        raise ValueError("Column weights must all be positive.")

    weight_total = float(sum(weights))
    raw = [total_width_dxa * float(weight) / weight_total for weight in weights]
    widths = [max(1, int(value)) for value in raw]

    # Give the final column the rounding remainder so the grid is exact.
    widths[-1] += total_width_dxa - sum(widths)
    if widths[-1] <= 0:
        raise ValueError("The requested widths cannot be represented safely.")
    return widths


def apply_table_geometry(
    table,
    column_widths_dxa: Sequence[int],
    *,
    table_width_dxa: int | None = None,
    indent_dxa: int = 0,
    cell_margins_dxa: Mapping[str, int] | None = None,
) -> None:
    """Apply a fixed table grid, column widths, indent and cell margins."""
    widths = [int(width) for width in column_widths_dxa]
    if len(widths) != len(table.columns):
        raise ValueError("Column width count must match the table column count.")
    if any(width <= 0 for width in widths):
        raise ValueError("Column widths must all be positive.")

    table_width = int(table_width_dxa if table_width_dxa is not None else sum(widths))
    if table_width <= 0 or indent_dxa < 0:
        raise ValueError("Table width must be positive and indent non-negative.")

    table.autofit = False
    table_properties = table._tbl.tblPr

    _set_width(_find_or_append(table_properties, "w:tblW"), table_width)

    indent = _find_or_append(table_properties, "w:tblInd")
    indent.set(qn("w:type"), "dxa")
    indent.set(qn("w:w"), str(int(indent_dxa)))

    layout = _find_or_append(table_properties, "w:tblLayout")
    layout.set(qn("w:type"), "fixed")

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        grid_column = OxmlElement("w:gridCol")
        grid_column.set(qn("w:w"), str(width))
        grid.append(grid_column)

    if cell_margins_dxa:
        margins = _find_or_append(table_properties, "w:tblCellMar")
        for side in ("top", "start", "bottom", "end"):
            value = int(cell_margins_dxa.get(side, 0))
            if value < 0:
                raise ValueError("Cell margins cannot be negative.")
            margin = _find_or_append(margins, f"w:{side}")
            margin.set(qn("w:type"), "dxa")
            margin.set(qn("w:w"), str(value))

    for row in table.rows:
        for column_index, cell in enumerate(row.cells):
            width = widths[column_index]
            cell.width = Twips(width)
            cell_properties = cell._tc.get_or_add_tcPr()
            _set_width(_find_or_append(cell_properties, "w:tcW"), width)
