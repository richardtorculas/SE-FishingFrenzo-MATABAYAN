import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# ============================================
# FIXTURES
# ============================================

# ============================================
# HELPER FUNCTIONS
# ============================================

def navigate_to_landing_page(driver):
    """Navigate to the landing page (home page)"""
    print("  - Navigating to landing page...")
    driver.get("http://localhost:3000")
    wait = WebDriverWait(driver, 10)
    # Wait for the main heading to load
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'MataBayan')]")))
    time.sleep(1)  # Pause to observe page load

def verify_landing_page_loaded(driver):
    """Verify that landing page has loaded successfully"""
    print("  - Verifying landing page elements...")
    wait = WebDriverWait(driver, 10)
    
    # Check main heading
    heading = wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'MataBayan')]")))
    assert heading.is_displayed(), "Main heading not visible"
    print("    ✓ Main heading found")
    time.sleep(0.5)
    
    # Check subtitle
    subtitle = driver.find_element(By.XPATH, "//*[contains(text(), 'Real-Time Disaster Preparedness')]")
    assert subtitle.is_displayed(), "Subtitle not visible"
    print("    ✓ Subtitle found")
    time.sleep(0.5)
    
    # Check Sign Up button in navbar
    signup_btn = driver.find_element(By.XPATH, "//nav//a[contains(text(), 'Sign Up')]")
    assert signup_btn.is_displayed(), "Sign Up button not visible"
    print("    ✓ Sign Up button found")
    time.sleep(0.5)
    
    # Check Log In button in navbar
    login_btn = driver.find_element(By.XPATH, "//nav//a[contains(text(), 'Log In')]")
    assert login_btn.is_displayed(), "Log In button not visible"
    print("    ✓ Log In button found")
    time.sleep(0.5)
    
    return True

def click_signup_button_in_navbar(driver):
    """Click the 'Sign Up' button in navigation bar"""
    print("  - Clicking Sign Up button...")
    wait = WebDriverWait(driver, 10)
    signup_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//nav//a[contains(text(), 'Sign Up')]")))
    time.sleep(1)  # Pause before clicking
    signup_btn.click()
    time.sleep(1)  # Pause after clicking

def click_login_button_in_navbar(driver):
    """Click the 'Log In' button in navigation bar"""
    print("  - Clicking Log In button...")
    wait = WebDriverWait(driver, 10)
    login_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//nav//a[contains(text(), 'Log In')]")))
    time.sleep(1)  # Pause before clicking
    login_btn.click()
    time.sleep(1)  # Pause after clicking

def verify_signup_page_loaded(driver):
    """Verify that signup page has loaded"""
    print("  - Verifying signup page loaded...")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("/signup"))
    # Check for signup page specific elements
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Account')]")))
    time.sleep(1)  # Pause to observe page
    return "/signup" in driver.current_url

def verify_login_page_loaded(driver):
    """Verify that login page has loaded"""
    print("  - Verifying login page loaded...")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("/login"))
    # Check for login page specific elements
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Welcome Back')]")))
    time.sleep(1)  # Pause to observe page
    return "/login" in driver.current_url

# ============================================
# TEST CASES
# ============================================

@pytest.mark.landing
def test_landing_page_loads(browser):
    """
    Test Case 1: Landing Page Loads Successfully
    - Open the landing page
    - Observe the main interface
    - Verify all main elements are present
    """
    print("\n[TEST 1] Testing Landing Page Loads Successfully...")
    
    # Step 1: Navigate to landing page
    navigate_to_landing_page(browser)
    
    # Step 2: Verify landing page elements
    assert verify_landing_page_loaded(browser), "Landing page did not load properly"
    
    # Step 3: Pause to observe the page
    print("  - Observing landing page...")
    time.sleep(2)
    
    print("✓ Landing page loaded successfully with all elements visible")

@pytest.mark.landing
def test_landing_page_signup_button(browser):
    """
    Test Case 2: Click Sign Up Button
    - Open the landing page
    - Click the "Sign Up" button
    - Verify redirect to signup page
    """
    print("\n[TEST 2] Testing Sign Up Button...")
    
    # Step 1: Navigate to landing page
    navigate_to_landing_page(browser)
    
    # Step 2: Verify landing page loaded
    verify_landing_page_loaded(browser)
    
    # Step 3: Click "Sign Up" button in navbar
    click_signup_button_in_navbar(browser)
    
    # Step 4: Verify redirect to signup page
    assert verify_signup_page_loaded(browser), "Failed to redirect to signup page"
    
    # Step 5: Pause to observe signup page
    print("  - Observing signup page...")
    time.sleep(2)
    
    print("✓ Successfully navigated to signup page from Sign Up button")

@pytest.mark.landing
def test_landing_page_login_button(browser):
    """
    Test Case 3: Click Log In Button
    - Open the landing page
    - Click the "Log In" button
    - Verify redirect to login page
    """
    print("\n[TEST 3] Testing Log In Button...")
    
    # Step 1: Navigate to landing page
    navigate_to_landing_page(browser)
    
    # Step 2: Verify landing page loaded
    verify_landing_page_loaded(browser)
    
    # Step 3: Click "Log In" button in navbar
    click_login_button_in_navbar(browser)
    
    # Step 4: Verify redirect to login page
    assert verify_login_page_loaded(browser), "Failed to redirect to login page"
    
    # Step 5: Pause to observe login page
    print("  - Observing login page...")
    time.sleep(2)
    
    print("✓ Successfully navigated to login page from Log In button")

# ============================================
# RUN ALL TESTS
# ============================================

if __name__ == "__main__":
    """
    Run all landing page tests
    Usage: python test_landing.py
    Or use pytest: pytest test_landing.py -v
    """
    pytest.main([__file__, "-v", "--tb=short"])
