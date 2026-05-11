import os
import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "http://localhost:3000"


def _make_driver():
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--remote-debugging-port=0")
    options.add_argument("--window-size=1920,1080")
    if os.getenv("HEADLESS", "false").lower() == "true":
        options.add_argument("--headless=new")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    driver.set_page_load_timeout(60)
    driver.implicitly_wait(20)
    return driver


@pytest.fixture
def browser():
    driver = _make_driver()
    yield driver
    driver.quit()


@pytest.fixture(scope="session")
def shared_weather_account():
    """Create one account for the entire weather test session."""
    driver = _make_driver()
    timestamp = int(time.time())
    creds = {"email": f"weathertest{timestamp}@example.com", "password": "WeatherPass123!"}
    wait = WebDriverWait(driver, 30)

    driver.get(f"{BASE_URL}/signup")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']"))).send_keys("Weather Test User")
    driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys(creds["email"])
    pwd_fields = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
    pwd_fields[0].send_keys(creds["password"])
    pwd_fields[1].send_keys(creds["password"])
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue')]"))).click()

    wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, "select")))
    time.sleep(1)
    Select(driver.find_elements(By.TAG_NAME, "select")[0]).select_by_visible_text("Metro Manila")
    time.sleep(0.5)
    Select(driver.find_elements(By.TAG_NAME, "select")[1]).select_by_visible_text("Manila")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Sign Up')]"))).click()
    wait.until(EC.url_contains("/dashboard"))

    driver.quit()
    return creds
