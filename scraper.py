from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json
import time

def scrape_faqs():

    # Open browser
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install())
    )

    # Open webpage
    url = "https://samagama.in/internship/faq"
    driver.get(url)

    # Wait for page to load
    time.sleep(5)

    # Get rendered HTML
    html = driver.page_source

    # Parse HTML
    soup = BeautifulSoup(html, "html.parser")

    # Lists
    questions = []
    answers = []

    # Find FAQ blocks
    faq_items = soup.find_all("details", class_="faq-q")

    print("FAQs found:", len(faq_items))

    for item in faq_items:

        text = item.get("data-text")

        if text:

            text = text.strip()

            parts = text.split("?", 1)

            if len(parts) == 2:

                question = parts[0].replace("§", "").strip() + "?"
                answer = parts[1].replace("§", "").strip()

                questions.append(question)
                answers.append(answer)

    # Create FAQ list
    faqs = []

    for q, a in zip(questions, answers):

        faqs.append({
            "question": q,
            "answer": a
        })

    # Save latest JSON
    with open("clean_faqs.json", "w", encoding="utf-8") as f:

        json.dump(
            faqs,
            f,
            indent=4,
            ensure_ascii=False
        )

    print("Latest FAQs saved successfully!")

    # Close browser
    driver.quit()