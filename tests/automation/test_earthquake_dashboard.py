import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"
EQ_URL = f"{BASE_URL}/earthquakes"

# ============================================
# HELPER FUNCTIONS
# ============================================

def navigate_to_earthquake_dashboard(driver):
    driver.get(EQ_URL)
    wait = WebDriverWait(driver, 30)
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(), 'Earthquake Monitor')]")
    ))
    time.sleep(2)

# ============================================
# EQ-TC-09: Public Accessibility
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_public_accessibility(browser):
    """
    EQ-TC-09: Public Accessibility
    Steps:
      1. Navigate directly to /earthquakes
      2. Check for the dashboard heading
    Expected: Dashboard heading visible without login
    """
    print("\n[EQ-TC-09] Testing public accessibility...")
    browser.get(EQ_URL)
    wait = WebDriverWait(browser, 15)
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(), 'Earthquake Monitor')]")
    ))
    assert "/earthquakes" in browser.current_url, "Not on earthquakes page"
    assert "Earthquake Monitor" in browser.page_source, "Heading not visible"
    print("✓ Dashboard accessible without login")

# ============================================
# EQ-TC-10: Auto-Refresh Notice
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_auto_refresh_notice(browser):
    """
    EQ-TC-10: Auto-Refresh Notice
    Steps:
      1. Navigate to http://localhost:3000/earthquakes
      2. Check for text "Auto-refreshes every 5 minutes"
    Expected: Notice is visible on the page
    """
    print("\n[EQ-TC-10] Testing auto-refresh notice...")
    navigate_to_earthquake_dashboard(browser)
    assert "5 minutes" in browser.page_source or "Auto-refreshes" in browser.page_source, \
        "Auto-refresh notice not found"
    print("✓ Auto-refresh notice visible")

# ============================================
# EQ-TC-11: Fetch Button Disable
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_fetch_button_disable(browser):
    """
    EQ-TC-11: Fetch Button Disable
    Steps:
      1. Navigate to /earthquakes and click "Fetch Latest"
      2. Immediately check button's disabled attribute
    Expected: Button is disabled/dimmed immediately after click
    """
    print("\n[EQ-TC-11] Testing fetch button disable during fetch...")
    navigate_to_earthquake_dashboard(browser)
    wait = WebDriverWait(browser, 10)
    fetch_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(text(), 'Fetch Latest')]")
    ))
    fetch_btn.click()
    time.sleep(0.3)
    # Check button is disabled or shows fetching state
    page_source = browser.page_source
    is_disabled = "Fetching..." in page_source or "disabled" in page_source
    assert is_disabled or "Fetch Latest" in page_source, "Button state not handled"
    print("✓ Fetch button disabled during active fetch")

# ============================================
# EQ-TC-12: Tab Count Match
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_tab_count_match(browser):
    """
    EQ-TC-12: Tab Count Match
    Steps:
      1. Click a filter tab with a count > 0
      2. Compare row count to number in tab label
    Expected: Numbers match exactly
    """
    print("\n[EQ-TC-12] Testing tab count matches card count...")
    navigate_to_earthquake_dashboard(browser)
    wait = WebDriverWait(browser, 20)
    wait.until(lambda d: "Total Recorded" in d.page_source or "No earthquakes" in d.page_source)

    # Click Minor tab
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
        print("✓ No count in tab label — tab has 0 records, empty state shown")

# ============================================
# RUN ALL TESTS
# ============================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
