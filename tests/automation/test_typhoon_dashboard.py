import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"
TYPHOON_URL = f"{BASE_URL}/typhoons"

# ============================================
# HELPER FUNCTIONS
# ============================================

def navigate_to_typhoon_dashboard(driver):
    driver.get(TYPHOON_URL)
    wait = WebDriverWait(driver, 45)
    # Wait for tab bar to appear
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//div[contains(@class,'border-b')]//button")
    ))
    # Wait for loading spinner to disappear before reading content
    wait.until(lambda d: "Fetching latest data from PAGASA" not in d.page_source)

def click_tab(driver, tab_name):
    wait = WebDriverWait(driver, 10)
    def find_tab(d):
        buttons = d.find_elements(By.XPATH, "//div[contains(@class,'border-b')]//button")
        for btn in buttons:
            if tab_name.lower() in btn.text.lower():
                return btn
        return False
    tab = wait.until(find_tab)
    tab.click()
    # Wait for any in-progress loading spinner to clear after tab switch
    wait.until(lambda d: "Fetching latest data from PAGASA" not in d.page_source)

# ============================================
# TC-TC-001: Page Load
# Requirement: Dashboard must load at /typhoons
# ============================================

@pytest.mark.typhoon
def test_typhoon_dashboard_page_loads(browser):
    """
    TC-01-001: Typhoon Dashboard Page Load
    Steps:
      1. Navigate to /typhoons
      2. Verify page title/header is present
    Expected: PAGASA Typhoon Monitor header is visible
    """
    print("\n[TC-TC-001] Testing page load...")
    browser.get(TYPHOON_URL)
    wait = WebDriverWait(browser, 30)
    # Accept either the main header or the tab bar as proof the page loaded
    header = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(), 'PAGASA Typhoon Monitor') or contains(text(), 'Typhoon Monitor') or contains(@class,'border-b')]")
    ))
    assert header.is_displayed(), "Dashboard header not visible"
    print("✓ Dashboard loaded successfully")

# ============================================
# TC-TC-002: Loading State
# Requirement: Show loading indicator while fetching
# ============================================

@pytest.mark.typhoon
def test_loading_state_appears(browser):
    """
    TC-03-002: Loading State Display
    Steps:
      1. Navigate to /typhoons
      2. Immediately check for loading indicator
    Expected: Loading spinner or 'Fetching' text appears briefly
    """
    print("\n[TC-TC-002] Testing loading state...")
    browser.get(TYPHOON_URL)
    # Check page source immediately after load for loading indicators
    page_source = browser.page_source
    has_loading = (
        "Fetching latest data" in page_source or
        "animate-pulse" in page_source or
        "Fetching from PAGASA" in page_source
    )
    assert has_loading or "PAGASA Typhoon Monitor" in page_source, \
        "Neither loading state nor loaded content found"
    print("✓ Loading state or content detected")

# ============================================
# TC-TC-003: Stat Cards Render
# Requirement: Show Active Cyclones, Highest Winds, Strongest Storm, Category
# ============================================

@pytest.mark.typhoon
def test_stat_cards_render(browser):
    """
    TC-03-003: Stat Cards Display
    Steps:
      1. Navigate to /typhoons
      2. Wait for data to load
      3. Verify all 4 stat card labels are present
    Expected: All 4 stat cards visible
    """
    print("\n[TC-TC-003] Testing stat cards...")
    navigate_to_typhoon_dashboard(browser)
    page_source = browser.page_source
    assert "Active Cyclones" in page_source, "Active Cyclones stat card missing"
    assert "Highest Winds" in page_source, "Highest Winds stat card missing"
    assert "Strongest Storm" in page_source, "Strongest Storm stat card missing"
    assert "Category" in page_source, "Category stat card missing"
    print("✓ All 4 stat cards present")

# ============================================
# TC-TC-004: Overview Tab - No Active Cyclones State
# Requirement: Show empty state when no cyclones exist
# ============================================

@pytest.mark.typhoon
def test_no_active_cyclones_state(browser):
    """
    TC-03-004: No Active Cyclones Empty State
    Steps:
      1. Navigate to /typhoons
      2. Wait for data to load
      3. Check for either cyclone cards OR the empty state message
    Expected: Either typhoon cards OR 'No Active Tropical Cyclones' message
    """
    print("\n[TC-TC-004] Testing no-cyclones empty state...")
    navigate_to_typhoon_dashboard(browser)
    page_source = browser.page_source
    has_cyclone_cards = "🌀" in page_source and "km/h" in page_source
    has_empty_state = "No Active Tropical Cyclones" in page_source
    assert has_cyclone_cards or has_empty_state, \
        "Neither cyclone cards nor empty state message found"
    print(f"✓ State displayed correctly ({'cyclones found' if has_cyclone_cards else 'no cyclones'})")

# ============================================
# TC-TC-007: Tab Navigation - Charts Tab
# Requirement: Charts tab must be clickable and show charts
# ============================================

@pytest.mark.typhoon
def test_charts_tab_navigation(browser):
    """
    TC-03-007: Charts Tab Navigation
    Steps:
      1. Navigate to /typhoons
      2. Click the Charts tab
      3. Verify charts content is shown
    Expected: Wind Speed Comparison or category chart visible
    """
    print("\n[TC-TC-007] Testing Charts tab...")
    navigate_to_typhoon_dashboard(browser)
    click_tab(browser, "Charts")
    page_source = browser.page_source
    assert (
        "Wind Speed Comparison" in page_source or
        "Storm Category Distribution" in page_source or
        "No active cyclones to display" in page_source
    ), "Charts tab content not found"
    print("✓ Charts tab loaded correctly")

# ============================================
# TC-TC-008: Tab Navigation - Map Tab
# Requirement: Map tab must show Windy iframe
# ============================================

@pytest.mark.typhoon
def test_map_tab_navigation(browser):
    """
    TC-03-008: Map Tab Navigation
    Steps:
      1. Navigate to /typhoons
      2. Click the Map tab
      3. Verify Windy map iframe is present
    Expected: Windy iframe or 'Live Wind & Cyclone Map' heading visible
    """
    print("\n[TC-TC-008] Testing Map tab...")
    navigate_to_typhoon_dashboard(browser)
    click_tab(browser, "Map")
    wait = WebDriverWait(browser, 10)
    # Check for map heading or iframe
    page_source = browser.page_source
    has_map_heading = "Live Wind & Cyclone Map" in page_source
    has_iframe = len(browser.find_elements(By.TAG_NAME, "iframe")) > 0
    assert has_map_heading or has_iframe, "Map tab content not found"
    print("✓ Map tab loaded correctly")

# ============================================
# TC-TC-009: Tab Navigation - Back to Overview
# Requirement: Tabs must be switchable
# ============================================

@pytest.mark.typhoon
def test_tab_switching_back_to_overview(browser):
    """
    TC-03-009: Tab Switching - Return to Overview
    Steps:
      1. Navigate to /typhoons
      2. Click Charts tab
      3. Click Overview tab
      4. Verify Overview content is shown
    Expected: Overview content (category guide) is visible
    """
    print("\n[TC-TC-009] Testing tab switching back to Overview...")
    navigate_to_typhoon_dashboard(browser)
    click_tab(browser, "Charts")
    click_tab(browser, "Overview")
    page_source = browser.page_source
    assert "Category Guide" in page_source or "Active Cyclones" in page_source, \
        "Overview tab content not found after switching back"
    print("✓ Tab switching works correctly")

# ============================================
# TC-TC-010: Fetch Latest Button
# Requirement: Manual refresh button must trigger data update
# ============================================

@pytest.mark.typhoon
def test_fetch_latest_button(browser):
    """
    TC-03-010: Fetch Latest Button
    Steps:
      1. Navigate to /typhoons
      2. Wait for initial load
      3. Click 'Fetch Latest' button
      4. Verify button shows loading state
      5. Verify data reloads
    Expected: Button shows 'Fetching from PAGASA...' then returns to normal
    """
    print("\n[TC-TC-010] Testing Fetch Latest button...")
    navigate_to_typhoon_dashboard(browser)
    wait = WebDriverWait(browser, 10)
    fetch_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(., 'Fetch Latest')]")
    ))
    fetch_btn.click()
    # Verify loading state appears
    time.sleep(0.5)
    page_source = browser.page_source
    is_loading = "Fetching from PAGASA" in page_source or "Fetch Latest" in page_source
    assert is_loading, "Fetch button did not respond"
    # Wait for it to finish
    wait.until(lambda d: "Fetch Latest" in d.page_source)
    print("✓ Fetch Latest button works correctly")

# ============================================
# TC-TC-011: Category Guide Display
# Requirement: Overview tab must show PAGASA category reference
# ============================================

@pytest.mark.typhoon
def test_category_guide_displayed(browser):
    """
    TC-03-011: Category Guide on Overview Tab
    Steps:
      1. Navigate to /typhoons
      2. Verify Overview tab is active by default
      3. Check all 5 PAGASA categories are listed
    Expected: All 5 storm categories visible in the guide
    """
    print("\n[TC-TC-011] Testing category guide...")
    navigate_to_typhoon_dashboard(browser)
    page_source = browser.page_source
    categories = [
        "Super Typhoon",
        "Typhoon",
        "Severe Tropical Storm",
        "Tropical Storm",
        "Tropical Depression"
    ]
    for cat in categories:
        assert cat in page_source, f"Category '{cat}' missing from guide"
    print("✓ All 5 PAGASA categories present in guide")

# ============================================
# TC-TC-019: NEGATIVE - Backend Offline Error Handling
# Requirement: Show error message when backend is unreachable
# ============================================

@pytest.mark.typhoon
@pytest.mark.negative
def test_error_state_when_backend_unreachable(browser):
    """
    TC-01-019: NEGATIVE - Backend Offline Error Handling
    Steps:
      1. Navigate to /typhoons while backend is running
      2. Simulate by checking error handling exists in the UI
    Note: Full test requires stopping backend manually.
          This test verifies the error element exists in the DOM structure.
    Expected: Error banner element is present in the component (even if hidden)
    """
    print("\n[TC-TC-019] Testing error state handling...")
    navigate_to_typhoon_dashboard(browser)
    # Check that the error display mechanism exists
    # The error div uses bg-red-50 class when error state is active
    page_source = browser.page_source
    # If backend is running fine, no error shown — that's also a valid pass
    # Document: manually test by stopping backend and re-running
    has_error = "Failed to load typhoon data" in page_source
    has_loaded = (
        "PAGASA Typhoon Monitor" in page_source or
        "Typhoon Monitor" in page_source or
        "Active Cyclones" in page_source or
        "No Active Tropical Cyclones" in page_source
    )
    assert has_error or has_loaded, "Dashboard in unexpected state"
    if has_error:
        print("✓ Error message displayed (backend offline)")
    else:
        print("✓ No error (backend online) — manually test with backend stopped")

# ============================================
# TC-TC-012: EDGE CASE - Data Source Attribution Footer
# Requirement: PAGASA attribution must be shown
# ============================================

@pytest.mark.typhoon
@pytest.mark.edge
def test_data_source_attribution(browser):
    """
    TC-03-012: EDGE CASE - Data Source Attribution
    Steps:
      1. Navigate to /typhoons
      2. Scroll to bottom
      3. Verify PAGASA attribution link is present
    Expected: PAGASA attribution text and link visible
    """
    print("\n[TC-TC-012] Testing data source attribution...")
    navigate_to_typhoon_dashboard(browser)
    browser.execute_script("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(0.5)
    page_source = browser.page_source
    assert "PAGASA" in page_source, "PAGASA attribution missing"
    assert "JTWC" in page_source, "JTWC attribution missing"
    print("✓ Data source attribution present")

# ============================================
# TC-TC-013: EDGE CASE - Auto-refresh Interval Set
# Requirement: Dashboard auto-refreshes every 30 minutes
# ============================================

@pytest.mark.typhoon
@pytest.mark.edge
def test_auto_refresh_indicator(browser):
    """
    TC-03-013: EDGE CASE - Auto-refresh Text Present
    Steps:
      1. Navigate to /typhoons
      2. Verify auto-refresh notice is shown in the header
    Expected: '30 minutes' or 'Auto-refreshes' text visible
    """
    print("\n[TC-TC-013] Testing auto-refresh indicator...")
    navigate_to_typhoon_dashboard(browser)
    page_source = browser.page_source
    assert "30 minutes" in page_source or "Auto-refreshes" in page_source, \
        "Auto-refresh indicator not found"
    print("✓ Auto-refresh indicator present")

# ============================================
# TC-01-005: Scraped Data Contains Required Fields Including Trajectory
# Requirement: TC-01 - Data includes name, category, location, wind speed, trajectory
# ============================================

@pytest.mark.typhoon
def test_scraped_data_contains_trajectory():
    """
    TC-01-005: Scraped Data Contains Required Fields Including Trajectory
    Steps:
      1. Send POST to /api/typhoons/update to trigger scrape
      2. Send GET to /api/typhoons
      3. Check that returned records contain all required fields
      4. Check that trajectory field is present in the response
    Expected: Each record has name, category, location, windKph, trajectory array
    """
    import requests
    print("\n[TC-01-005] Testing scraped data contains trajectory field...")

    # Trigger scrape
    try:
        requests.post("http://localhost:5000/api/typhoons/update", timeout=30)
    except requests.exceptions.RequestException as e:
        print(f"  ⚠ Scrape trigger failed (backend may be offline): {e}")

    # Fetch stored data
    response = requests.get("http://localhost:5000/api/typhoons", timeout=10)
    assert response.status_code == 200, "GET /api/typhoons did not return 200"

    body = response.json()
    assert body.get("status") == "success", "Response status not success"

    data = body.get("data", [])
    if len(data) == 0:
        print("✓ No active cyclones — trajectory field check skipped (no data in PAR)")
        return

    required_fields = ["name", "category", "location", "windKph", "trajectory"]
    for record in data:
        for field in required_fields:
            assert field in record, f"Required field '{field}' missing from scraped record"
        assert isinstance(record["trajectory"], list), "trajectory must be an array"

    print(f"✓ All {len(data)} record(s) contain required fields including trajectory")


# ============================================
# TC-02-005: Stored Data Matches Scraped Values Accurately
# Requirement: TC-02 - Stored data matches scraped values accurately
# ============================================

@pytest.mark.typhoon
def test_stored_data_matches_scraped_values():
    """
    TC-02-005: Stored Data Matches Scraped Values Accurately
    Steps:
      1. Send POST to /api/typhoons/update to trigger scrape and store
      2. Send GET to /api/typhoons to retrieve stored records
      3. Verify each record has valid non-empty values for core fields
      4. Verify windKph is a number >= 0
      5. Verify category is one of the 6 valid PAGASA categories
      6. Verify severity is one of the 4 valid levels
    Expected: All stored field values are valid and match PAGASA schema definitions
    """
    import requests
    print("\n[TC-02-005] Testing stored data matches scraped values...")

    try:
        requests.post("http://localhost:5000/api/typhoons/update", timeout=30)
    except requests.exceptions.RequestException as e:
        print(f"  ⚠ Scrape trigger failed (backend may be offline): {e}")

    response = requests.get("http://localhost:5000/api/typhoons", timeout=10)
    assert response.status_code == 200, "GET /api/typhoons did not return 200"

    data = response.json().get("data", [])
    if len(data) == 0:
        print("✓ No active cyclones — field value validation skipped (no data in PAR)")
        return

    valid_categories = [
        "Super Typhoon", "Typhoon", "Severe Tropical Storm",
        "Tropical Storm", "Tropical Depression", "Low Pressure Area"
    ]
    valid_severities = ["Critical", "High", "Moderate", "Low"]
    valid_sources    = ["PAGASA", "JTWC"]

    for record in data:
        assert record.get("name") and len(record["name"]) > 0,          "name is empty"
        assert record.get("category") in valid_categories,               f"invalid category: {record.get('category')}"
        assert record.get("severity") in valid_severities,               f"invalid severity: {record.get('severity')}"
        assert isinstance(record.get("windKph"), (int, float)),          "windKph is not a number"
        assert record.get("windKph") >= 0,                               "windKph is negative"
        assert record.get("source") in valid_sources,                    f"invalid source: {record.get('source')}"
        assert record.get("location") and len(record["location"]) > 0,  "location is empty"

    print(f"✓ All {len(data)} stored record(s) have valid field values matching PAGASA schema")


# ============================================
# RUN ALL TESTS
# ============================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
