import json
from pathlib import Path

import pdfplumber

headers = ["ID", "Lënda", "Pikë Totale", "Nota e Shkallëzuar", "Nota"]

script_dir = Path(__file__).resolve().parent
pdfs_dir = script_dir / "data" / "pdfs"
out_dir = script_dir / "data" / "out"

out_dir.mkdir(parents=True, exist_ok=True)

pdf_files = sorted(pdfs_dir.glob("*.pdf"))

print(f"Found {len(pdf_files)} PDF files")

for pdf_path in pdf_files:
    json_path = out_dir / f"{pdf_path.stem}.json"

    print(f"\nProcessing: {pdf_path.name}")

    with (
        pdfplumber.open(pdf_path) as pdf,
        open(json_path, "w", encoding="utf-8") as json_file,
    ):
        json_file.write("[\n")

        is_first_record = True

        for i, page in enumerate(pdf.pages):
            table = page.extract_table()

            if not table:
                continue

            for row in table:
                if not row or not row[0] or str(row[0]).strip() == "ID":
                    continue

                record = {}

                for j, header in enumerate(headers):
                    val = row[j] if j < len(row) else None

                    if isinstance(val, str):
                        val = val.replace("\n", " ").strip()

                    if (
                        header
                        in [
                            "Pikë Totale",
                            "Nota e Shkallëzuar",
                            "Nota",
                        ]
                        and val
                    ):
                        try:
                            val = float(val)
                        except ValueError:
                            pass

                    record[header] = val

                if not is_first_record:
                    json_file.write(",\n")

                json_string = json.dumps(
                    record,
                    ensure_ascii=False,
                    indent=4,
                )

                indented_string = "    " + json_string.replace("\n", "\n    ")
                json_file.write(indented_string)

                is_first_record = False

            if (i + 1) % 50 == 0:
                print(f"  Processed {i + 1} pages...")

        json_file.write("\n]")

    print(f"  Saved: {json_path}")

print("\nAll PDFs processed!")
