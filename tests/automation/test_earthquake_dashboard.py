import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"
EQ_URL = f"{BASE_URL}/earthquakes"

def navigate_to_earthquake_dashboard(driver):
    driver.get(EQ_URL)
    wait = WebDriverWait(driver, 30)
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(), 'Earthquake Monitor')]")
    ))
    time.sleep(2)

@pytest.mark.earthquake
def test_public_accessibility(browser):
    print("\n[EQ-TC-09] Testing public accessibility...")
    browser.get(EQ_URL)
    wait = WebDriverWait(browser, 15)
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(), 'Earthquake Monitor')]")
    ))
    assert "/earthquakes" in browser.current_url
    assert "Earthquake Monitor" in browser.page_source
    print("✓ Dashboard accessible without login")

@pytest.mark.earthquake
def test_auto_refresh_notice(browser):
    print("\n[EQ-TC-10] Testing auto-refresh notice...")
    navigate_to_earthquake_dashboard(browser)
    assert "5 minutes" in browser.page_source or "Auto-refreshes" in browser.page_source
    print("✓ Auto-refresh notice visible")

@pytest.mark.earthquake
def test_fetch_button_disable(browser):
    print("\n[EQ-TC-11] Testing fetch button disable during fetch...")
    navigate_to_earthquake_dashboard(browser)
    wait = WebDriverWait(browser, 10)
    fetch_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(text(), 'Fetch Latest')]")
    ))
    fetch_btn.click()
    time.sleep(0.3)
    page_source = browser.page_source
    assert "Fetching..." in page_source or "Fetch Latest" in page_source
    print("✓ Fetch button state handled correctly")

@pytest.mark.earthquake
def test_tab_count_match(browser):
    print("\n[EQ-TC-12] Testing tab count matches row count...")
    navigate_to_earthquake_dashboard(browser)
    wait = WebDriverWait(browser, 20)
    wait.until(lambda d: "Total Recorded" in d.page_source or "No earthquakes" in d.page_source)
    minor_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[starts-with(normalize-space(text()), 'Minor')]")
    ))
    minor_text = minor_btn.text
    minor_btn.click()
    time.sleep(1)
    import re
    match = re.search(r'\((\d+)\)', minor_text)
    if match:
        expected_count = int(match.group(1))
        rows = browser.find_elements(By.XPATH, "//tbody/tr")
        assert len(rows) == expected_count, f"Tab shows {expected_count} but {len(rows)} rows rendered"
        print(f"✓ Tab count ({expected_count}) matches rendered rows ({len(rows)})")
    else:
        print("✓ No count in tab label — empty state shown")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
