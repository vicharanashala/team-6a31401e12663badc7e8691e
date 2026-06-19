from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json
import time
import re
from pathlib import Path


def scrape_faqs():

    # Chrome options
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Start Chrome in background
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    # Open webpage
    url = "https://samagama.in/internship/faq"
    driver.get(url)

    # Wait for JS to load
    time.sleep(5)

    # Get page source
    html = driver.page_source

    # Parse HTML
    soup = BeautifulSoup(html, "html.parser")

    # Build category map dynamically
    category_map = {}

    toc = soup.find("ul", class_="toc-section-list")

    if toc:
        for li in toc.find_all("li", recursive=False):

            strong = li.find("strong")

            if strong:

                text = strong.get_text(strip=True)

                match = re.match(r"(\d+)\.\s*(.*)", text)

                if match:
                    section_number = match.group(1)
                    section_name = match.group(2).strip()

                    category_map[section_number] = section_name

    print("Categories found:", len(category_map))

    faqs = []

    # Find FAQ blocks
    faq_items = soup.find_all("details", class_="faq-q")

    print("FAQs found:", len(faq_items))

    for item in faq_items:

        text = item.get("data-text")

        if not text:
            continue

        text = text.strip()

        parts = text.split("?", 1)

        if len(parts) != 2:
            continue

        question = parts[0].replace("§", "").strip() + "?"
        answer = parts[1].replace("§", "").strip()

        match = re.match(r"(\d+\.\d+)\s+(.*)", question)

        if match:

            faq_id = match.group(1)
            question_text = match.group(2)

            section_number = faq_id.split(".")[0]

            category = category_map.get(section_number, "Unknown")

        else:

            faq_id = ""
            question_text = question
            category = "Unknown"

        faqs.append({
            "id": faq_id,
            "category": category,
            "question": question_text,
            "answer": answer
        })

    print("FAQs extracted:", len(faqs))

    # Save JSON
    output_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "faqs.json"
    )

    with open(output_path, "w", encoding="utf-8") as f:

        json.dump(
            faqs,
            f,
            indent=4,
            ensure_ascii=False
        )

    print("Latest FAQs saved successfully!")

    # Close browser
    driver.quit()


if __name__ == "__main__":
    scrape_faqs()