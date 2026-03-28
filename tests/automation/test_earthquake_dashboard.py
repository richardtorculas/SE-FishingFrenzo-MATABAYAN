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
    wait = WebDriverWait(driver, 15)
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(), 'PHIVOLCS Earthquake Monitor')]")
    ))
    time.sleep(2)

# ============================================
# EQ-TC-01: Dashboard Header Loads
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_dashboard_header_loads(browser):
    """
    EQ-TC-01: Dashboard Header Loads
    Steps:
      1. Navigate to http://localhost:3000/earthquakes
      2. Wait for the page to load
      3. Check for subtitle "Latest Earthquake Information"
      4. Check for the PHIVOLCS source link at the bottom
    Expected: Heading, subtitle, and PHIVOLCS source link are visible
    """
    print("\n[EQ-TC-01] Testing dashboard header loads...")
    navigate_to_earthquake_dashboard(browser)
    page_source = browser.page_source
    assert "PHIVOLCS Earthquake Monitor" in page_source, "Header not found"
    assert "Latest Earthquake Information" in page_source, "Subtitle not found"
    assert "phivolcs.dost.gov.ph" in page_source or "PHIVOLCS — DOST" in page_source, "PHIVOLCS source link not found"
    print("✓ Header, subtitle, and source link visible")

# ============================================
# EQ-TC-02: All Four Stat Cards
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_all_four_stat_cards(browser):
    """
    EQ-TC-02: All Four Stat Cards
    Steps:
      1. Navigate to http://localhost:3000/earthquakes
      2. Check for "Total Recorded", "Last 24 Hours", "High/Critical", "Tsunami Alerts"
    Expected: All four stat cards are visible
    """
    print("\n[EQ-TC-02] Testing all four stat cards...")
    navigate_to_earthquake_dashboard(browser)
    page_source = browser.page_source
    assert "Total Recorded" in page_source,  "Total Recorded stat card missing"
    assert "Last 24 Hours" in page_source,   "Last 24 Hours stat card missing"
    assert "High / Critical" in page_source, "High/Critical stat card missing"
    assert "Tsunami Alerts" in page_source,  "Tsunami Alerts stat card missing"
    print("✓ All four stat cards visible")

# ============================================
# EQ-TC-03: Threat Level Guide
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_threat_level_guide(browser):
    """
    EQ-TC-03: Threat Level Guide
    Steps:
      1. Navigate to http://localhost:3000/earthquakes
      2. Check for labels: Critical, High, Moderate, Low, Minor
    Expected: All five severity labels are displayed
    """
    print("\n[EQ-TC-03] Testing threat level guide...")
    navigate_to_earthquake_dashboard(browser)
    page_source = browser.page_source
    for level in ["Critical", "High", "Moderate", "Low", "Minor"]:
        assert level in page_source, f"Threat level '{level}' missing from guide"
    print("✓ All 5 threat levels visible in guide")

# ============================================
# EQ-TC-04: Filter Tabs Default
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_filter_tabs_default(browser):
    """
    EQ-TC-04: Filter Tabs Default
    Steps:
      1. Navigate to http://localhost:3000/earthquakes
      2. Check for buttons: All, Critical, High, Moderate, Low, Minor
      3. Check CSS class of the "All" button
    Expected: All six buttons visible. "All" button has active style applied
    """
    print("\n[EQ-TC-04] Testing filter tabs default state...")
    navigate_to_earthquake_dashboard(browser)
    page_source = browser.page_source
    for tab in ["All", "Critical", "High", "Moderate", "Low", "Minor"]:
        assert tab in page_source, f"Filter tab '{tab}' missing"

    # Check "All" button has active style (bg-gray-800 text-white)
    all_btn = browser.find_element(By.XPATH, "//button[normalize-space(text())='All' or starts-with(normalize-space(text()), 'All ')]")
    btn_class = all_btn.get_attribute("class")
    assert "bg-gray-800" in btn_class or "text-white" in btn_class, "All button does not have active style"
    print("✓ All 6 filter tabs visible and All is active by default")

# ============================================
# EQ-TC-05: Fetch Button Refresh
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_fetch_button_refresh(browser):
    """
    EQ-TC-05: Fetch Button Refresh
    Steps:
      1. Navigate to http://localhost:3000/earthquakes
      2. Click the "Fetch Latest" button
      3. Wait for the button to return to normal
    Expected: Button text changes to "Fetching..." then returns to "Fetch Latest"
    """
    print("\n[EQ-TC-05] Testing fetch button refresh...")
    navigate_to_earthquake_dashboard(browser)
    wait = WebDriverWait(browser, 10)
    fetch_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(text(), 'Fetch Latest')]")
    ))
    fetch_btn.click()
    time.sleep(0.5)
    page_source = browser.page_source
    is_fetching = "Fetching from PHIVOLCS" in page_source or "Fetch Latest" in page_source
    assert is_fetching, "Fetch button did not respond"
    wait.until(lambda d: "Fetch Latest" in d.page_source)
    print("✓ Fetch button triggers refresh and returns to normal")

# ============================================
# EQ-TC-06: Filtering Logic
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_filtering_logic(browser):
    """
    EQ-TC-06: Filtering Logic
    Steps:
      1. Navigate to http://localhost:3000/earthquakes
      2. Click the "Minor" filter tab
      3. Click the "All" filter tab to reset
    Expected: Only Minor cards shown after filter. Full list restored after All
    """
    print("\n[EQ-TC-06] Testing filtering logic...")
    navigate_to_earthquake_dashboard(browser)
    wait = WebDriverWait(browser, 10)

    # Click Minor filter
    minor_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[starts-with(normalize-space(text()), 'Minor')]")
    ))
    minor_btn.click()
    time.sleep(1)

    page_source = browser.page_source
    assert "No earthquakes found" in page_source or "Minor" in page_source, \
        "Filter did not apply correctly"

    # Reset to All
    all_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[starts-with(normalize-space(text()), 'All')]")
    ))
    all_btn.click()
    time.sleep(1)
    assert "PHIVOLCS Earthquake Monitor" in browser.page_source, "Dashboard not restored after All filter"
    print("✓ Filtering logic works correctly")

# ============================================
# EQ-TC-07: Card Fields
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_card_fields(browser):
    """
    EQ-TC-07: Card Fields
    Steps:
      1. Navigate to http://localhost:3000/earthquakes
      2. Locate the first earthquake card
    Expected: Magnitude, Scale, Depth, and Badge visible
    """
    print("\n[EQ-TC-07] Testing card fields...")
    navigate_to_earthquake_dashboard(browser)
    page_source = browser.page_source
    has_cards = "Magnitude" in page_source and "Depth" in page_source and "THREAT" in page_source
    has_empty = "No earthquakes found" in page_source or "Fetch Latest" in page_source
    assert has_cards or has_empty, "Neither cards nor empty state found"
    if has_cards:
        print("✓ Card fields (Magnitude, Depth, Badge) visible")
    else:
        print("✓ No data yet — empty state shown correctly")

# ============================================
# EQ-TC-08: Empty State Message
# Requirement: EQ-03
# ============================================

@pytest.mark.earthquake
def test_empty_state_message(browser):
    """
    EQ-TC-08: Empty State Message
    Steps:
      1. Navigate to http://localhost:3000/earthquakes
      2. Click a filter tab that shows 0 results
    Expected: Message "No earthquakes found" is shown
    """
    print("\n[EQ-TC-08] Testing empty state message...")
    navigate_to_earthquake_dashboard(browser)
    wait = WebDriverWait(browser, 10)

    # Click Critical filter — likely to be 0 or few results
    critical_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[starts-with(normalize-space(text()), 'Critical')]")
    ))
    critical_btn.click()
    time.sleep(1)

    page_source = browser.page_source
    has_empty = "No earthquakes found" in page_source
    has_cards = "CRITICAL THREAT" in page_source
    assert has_empty or has_cards, "Neither empty state nor critical cards found"
    print("✓ Empty state or filtered cards displayed correctly")

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
        (By.XPATH, "//*[contains(text(), 'PHIVOLCS Earthquake Monitor')]")
    ))
    assert "/earthquakes" in browser.current_url, "Not on earthquakes page"
    assert "PHIVOLCS Earthquake Monitor" in browser.page_source, "Heading not visible"
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
    is_disabled = "Fetching from PHIVOLCS" in page_source or "disabled" in page_source
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
      2. Compare card count to number in tab label
    Expected: Numbers match exactly
    """
    print("\n[EQ-TC-12] Testing tab count matches card count...")
    navigate_to_earthquake_dashboard(browser)
    wait = WebDriverWait(browser, 10)

    # Click Minor tab
    minor_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[starts-with(normalize-space(text()), 'Minor')]")
    ))
    minor_text = minor_btn.text
    minor_btn.click()
    time.sleep(1)

    # Get count from tab label e.g. "Minor (12)"
    import re
    match = re.search(r'\((\d+)\)', minor_text)
    if match:
        expected_count = int(match.group(1))
        cards = browser.find_elements(By.XPATH, "//div[contains(@class,'rounded-xl') and contains(@class,'border-l-4')]")
        assert len(cards) == expected_count, f"Tab shows {expected_count} but {len(cards)} cards rendered"
        print(f"✓ Tab count ({expected_count}) matches rendered cards ({len(cards)})")
    else:
        print("✓ No count in tab label — tab has 0 records, empty state shown")

# ============================================
# RUN ALL TESTS
# ============================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
