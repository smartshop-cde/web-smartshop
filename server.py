from __future__ import annotations

import json
import mimetypes
import re
import sqlite3
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote

from openpyxl import Workbook, load_workbook


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "smartshop.sqlite3"
SEED_PATH = DATA_DIR / "seed.json"
DEFAULT_PRODUCT_IMAGE = "assets/logo-smartshop.png"


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def slugify(value: str, fallback: str = "item") -> str:
    value = (value or fallback).strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value or fallback


def init_db() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS store_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                sku TEXT NOT NULL UNIQUE,
                price REAL NOT NULL DEFAULT 0,
                stock INTEGER NOT NULL DEFAULT 0,
                featured INTEGER NOT NULL DEFAULT 0,
                badge TEXT DEFAULT '',
                condition TEXT DEFAULT '',
                warranty TEXT DEFAULT '',
                delivery TEXT DEFAULT '',
                description TEXT DEFAULT '',
                details TEXT NOT NULL DEFAULT '[]',
                image TEXT DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS sellers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT DEFAULT '',
                phone TEXT DEFAULT '',
                schedule TEXT DEFAULT '',
                message TEXT DEFAULT '',
                image TEXT DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0
            );
            """
        )
        count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        if count == 0 and SEED_PATH.exists():
            save_catalog(conn, json.loads(SEED_PATH.read_text(encoding="utf-8")))


def get_catalog() -> dict:
    with connect() as conn:
        store_rows = conn.execute("SELECT key, value FROM store_settings").fetchall()
        store = {row["key"]: json.loads(row["value"]) for row in store_rows}
        products = [
            {
                **dict(row),
                "featured": bool(row["featured"]),
                "details": json.loads(row["details"] or "[]"),
            }
            for row in conn.execute("SELECT * FROM products ORDER BY sort_order, name").fetchall()
        ]
        sellers = [
            dict(row)
            for row in conn.execute("SELECT * FROM sellers ORDER BY sort_order, name").fetchall()
        ]
    return {"store": store, "products": products, "sellers": sellers}


def save_catalog(conn: sqlite3.Connection, catalog: dict) -> None:
    store = catalog.get("store") or {}
    products = catalog.get("products") or []
    sellers = catalog.get("sellers") or []

    conn.execute("DELETE FROM store_settings")
    conn.execute("DELETE FROM products")
    conn.execute("DELETE FROM sellers")

    for key, value in store.items():
        conn.execute(
            "INSERT INTO store_settings (key, value) VALUES (?, ?)",
            (key, json.dumps(value, ensure_ascii=False)),
        )

    for index, product in enumerate(products):
        product_id = product.get("id") or slugify(product.get("sku") or product.get("name"), "product")
        details = product.get("details") if isinstance(product.get("details"), list) else []
        conn.execute(
            """
            INSERT INTO products (
                id, name, category, sku, price, stock, featured, badge, condition,
                warranty, delivery, description, details, image, sort_order
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product_id,
                product.get("name") or "Producto",
                product.get("category") or "General",
                product.get("sku") or product_id,
                float(product.get("price") or 0),
                int(product.get("stock") or 0),
                1 if product.get("featured") else 0,
                product.get("badge") or "",
                product.get("condition") or "",
                product.get("warranty") or "",
                product.get("delivery") or "",
                product.get("description") or "",
                json.dumps(details, ensure_ascii=False),
                product.get("image") or DEFAULT_PRODUCT_IMAGE,
                index,
            ),
        )

    for index, seller in enumerate(sellers):
        seller_id = seller.get("id") or slugify(seller.get("name"), f"seller-{index + 1}")
        conn.execute(
            """
            INSERT INTO sellers (id, name, role, phone, schedule, message, image, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                seller_id,
                seller.get("name") or "Vendedor",
                seller.get("role") or "",
                seller.get("phone") or "",
                seller.get("schedule") or "",
                seller.get("message") or "",
                seller.get("image") or DEFAULT_PRODUCT_IMAGE,
                index,
            ),
        )


def verify_pin(headers, catalog: dict | None = None) -> bool:
    catalog = catalog or get_catalog()
    expected_pin = str((catalog.get("store") or {}).get("adminPin") or "")
    sent_pin = headers.get("X-Admin-Pin") or ""
    return bool(expected_pin and sent_pin == expected_pin)


def export_products_excel() -> bytes:
    catalog = get_catalog()
    wb = Workbook()
    ws = wb.active
    ws.title = "Productos"
    headers = [
        "accion",
        "sku",
        "name",
        "category",
        "price",
        "stock",
        "featured",
        "badge",
        "condition",
        "warranty",
        "delivery",
        "description",
        "details",
    ]
    ws.append(headers)
    for product in catalog["products"]:
        ws.append(
            [
                "",
                product.get("sku"),
                product.get("name"),
                product.get("category"),
                product.get("price"),
                product.get("stock"),
                "SI" if product.get("featured") else "NO",
                product.get("badge"),
                product.get("condition"),
                product.get("warranty"),
                product.get("delivery"),
                product.get("description"),
                "\n".join(product.get("details") or []),
            ]
        )
    for cell in ws[1]:
        cell.style = "Headline 3"
    for column in ws.columns:
        max_length = max(len(str(cell.value or "")) for cell in column)
        ws.column_dimensions[column[0].column_letter].width = min(max(max_length + 2, 12), 42)
    output = BytesIO()
    wb.save(output)
    return output.getvalue()


def import_products_excel(body: bytes) -> dict:
    wb = load_workbook(BytesIO(body), data_only=True)
    ws = wb.active
    headers = [str(cell.value or "").strip().lower() for cell in ws[1]]
    header_index = {name: idx for idx, name in enumerate(headers)}
    required = {"sku", "name", "category", "price", "stock"}
    missing = sorted(required - set(header_index))
    if missing:
        raise ValueError(f"Faltan columnas requeridas: {', '.join(missing)}")

    catalog = get_catalog()
    products_by_sku = {str(p.get("sku")): p for p in catalog["products"]}
    imported = 0
    deleted = 0

    def cell(row, name, default=""):
        idx = header_index.get(name)
        if idx is None:
            return default
        value = row[idx].value
        return default if value is None else value

    for row in ws.iter_rows(min_row=2):
        sku = str(cell(row, "sku", "")).strip()
        if not sku:
            continue
        action = str(cell(row, "accion", "")).strip().lower()
        if action in {"eliminar", "delete", "quitar", "borrar"}:
            if sku in products_by_sku:
                products_by_sku.pop(sku)
                deleted += 1
            continue

        current = products_by_sku.get(sku, {})
        details_value = str(cell(row, "details", "") or "")
        products_by_sku[sku] = {
            **current,
            "id": current.get("id") or slugify(sku, "product"),
            "sku": sku,
            "name": str(cell(row, "name", current.get("name") or "Producto")).strip(),
            "category": str(cell(row, "category", current.get("category") or "General")).strip(),
            "price": float(cell(row, "price", current.get("price") or 0) or 0),
            "stock": int(cell(row, "stock", current.get("stock") or 0) or 0),
            "featured": str(cell(row, "featured", current.get("featured") or "NO")).strip().lower()
            in {"si", "sí", "true", "1", "yes"},
            "badge": str(cell(row, "badge", current.get("badge") or "")).strip(),
            "condition": str(cell(row, "condition", current.get("condition") or "Nuevo")).strip(),
            "warranty": str(cell(row, "warranty", current.get("warranty") or "Garantia de tienda")).strip(),
            "delivery": str(cell(row, "delivery", current.get("delivery") or "Retiro en tienda o envio coordinado")).strip(),
            "description": str(cell(row, "description", current.get("description") or "")).strip(),
            "details": [line.strip() for line in details_value.splitlines() if line.strip()],
            "image": current.get("image") or DEFAULT_PRODUCT_IMAGE,
        }
        imported += 1

    catalog["products"] = list(products_by_sku.values())
    with connect() as conn:
        save_catalog(conn, catalog)
    return {"imported": imported, "deleted": deleted, "total": len(catalog["products"])}


class SmartShopHandler(SimpleHTTPRequestHandler):
    server_version = "SmartShopHTTP/1.0"

    def translate_path(self, path: str) -> str:
        path = unquote(path.split("?", 1)[0].split("#", 1)[0]).lstrip("/")
        resolved = (ROOT / path).resolve()
        if resolved != ROOT and ROOT not in resolved.parents:
            return str(ROOT / "index.html")
        return str(resolved)

    def do_GET(self) -> None:
        if self.path == "/api/catalog":
            return self.send_json(get_catalog())
        if self.path == "/api/products/export-excel":
            if not verify_pin(self.headers):
                return self.send_json({"error": "No autorizado"}, HTTPStatus.UNAUTHORIZED)
            body = export_products_excel()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            self.send_header("Content-Disposition", 'attachment; filename="smartshop-productos.xlsx"')
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def do_POST(self) -> None:
        if self.path == "/api/login":
            body = self.read_json()
            pin = str((body or {}).get("pin") or "")
            if verify_pin({"X-Admin-Pin": pin}):
                return self.send_json({"ok": True})
            return self.send_json({"ok": False, "error": "PIN incorrecto"}, HTTPStatus.UNAUTHORIZED)
        if self.path == "/api/products/import-excel":
            if not verify_pin(self.headers):
                return self.send_json({"error": "No autorizado"}, HTTPStatus.UNAUTHORIZED)
            length = int(self.headers.get("Content-Length") or 0)
            body = self.rfile.read(length)
            try:
                result = import_products_excel(body)
            except Exception as exc:  # noqa: BLE001
                return self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            return self.send_json(result)
        return self.send_json({"error": "Ruta no encontrada"}, HTTPStatus.NOT_FOUND)

    def do_PUT(self) -> None:
        if self.path != "/api/catalog":
            return self.send_json({"error": "Ruta no encontrada"}, HTTPStatus.NOT_FOUND)
        if not verify_pin(self.headers):
            return self.send_json({"error": "No autorizado"}, HTTPStatus.UNAUTHORIZED)
        catalog = self.read_json()
        with connect() as conn:
            save_catalog(conn, catalog or {})
        return self.send_json({"ok": True})

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def guess_type(self, path: str) -> str:
        if path.endswith(".webp"):
            return "image/webp"
        return mimetypes.guess_type(path)[0] or "application/octet-stream"


def main() -> None:
    init_db()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), SmartShopHandler)
    print("SmartShop disponible en http://127.0.0.1:8000")
    server.serve_forever()


if __name__ == "__main__":
    main()
