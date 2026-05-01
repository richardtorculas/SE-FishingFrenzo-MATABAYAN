import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time

# ============================================
# FIXTURES
# ============================================

@pytest.fixture
def unique_email():
    """Generate unique email for each test"""
    timestamp = int(time.time())
    return f"testuser{timestamp}@example.com"

# ============================================
# HELPER FUNCTIONS
# ============================================

def navigate_to_signup(driver):
    """Navigate to the signup page"""
    driver.get("http://localhost:3000/signup")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']")))

def fill_step1_account_info(driver, name, email, password, confirm_password):
    """Fill Step 1: Account Information"""
    wait = WebDriverWait(driver, 10)
    
    # Enter name
    name_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']")))
    name_field.clear()
    if name:
        name_field.send_keys(name)
    
    # Enter email
    email_field = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
    email_field.clear()
    if email:
        email_field.send_keys(email)
    
    # Enter password
    password_fields = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
    password_fields[0].clear()
    if password:
        password_fields[0].send_keys(password)
    
    # Enter confirm password
    password_fields[1].clear()
    if confirm_password:
        password_fields[1].send_keys(confirm_password)

def click_continue_button(driver):
    """Click the Continue button on Step 1"""
    wait = WebDriverWait(driver, 10)
    continue_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue')]")))
    continue_btn.click()

def fill_step2_location_info(driver, province, city, language="en"):
    """Fill Step 2: Location Information"""
    wait = WebDriverWait(driver, 10)
    
    # Wait for select elements to be present
    wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, "select")))
    time.sleep(0.5)  # Brief wait for React state update
    
    # Select province
    if province:
        province_select = Select(driver.find_elements(By.TAG_NAME, "select")[0])
        province_select.select_by_visible_text(province)
        time.sleep(0.5)  # Wait for cities to load
    
    # Select city
    if city:
        city_select = Select(driver.find_elements(By.TAG_NAME, "select")[1])
        city_select.select_by_visible_text(city)
    
    # Select language (default is English)
    if language == "fil":
        filipino_radio = driver.find_element(By.CSS_SELECTOR, "input[value='fil']")
        filipino_radio.click()

def click_signup_button(driver):
    """Click the Sign Up button on Step 2"""
    wait = WebDriverWait(driver, 10)
    signup_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Sign Up')]")))
    signup_btn.click()

def verify_dashboard_redirect(driver):
    """Verify successful redirect to dashboard"""
    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("/dashboard"))
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Welcome')]")))
    return "/dashboard" in driver.current_url

def check_error_message(driver):
    """Check if error message is displayed"""
    try:
        error_element = driver.find_element(By.CSS_SELECTOR, ".text-red-500, .text-red-600")
        return error_element.is_displayed()
    except:
        return False

# ============================================
# TEST CASES
# ============================================

@pytest.mark.signup
def test_successful_signup(browser, unique_email):
    """
    Test Case 1: Successful Sign-Up
    - Fill all required fields with valid data
    - Complete both steps
    - Verify successful registration and dashboard redirect
    """
    print("\n[TEST 1] Testing Successful Sign-Up...")
    
    # Step 1: Navigate to signup page
    navigate_to_signup(browser)
    
    # Step 2: Fill account information
    fill_step1_account_info(
        browser,
        name="John Dela Cruz",
        email=unique_email,
        password="SecurePass123!",
        confirm_password="SecurePass123!"
    )
    
    # Step 3: Click Continue button
    click_continue_button(browser)
    time.sleep(1)
    
    # Step 4: Fill location information
    fill_step2_location_info(
        browser,
        province="Metro Manila",
        city="Manila",
        language="en"
    )
    
    # Step 5: Click Sign Up button
    click_signup_button(browser)
    
    # Step 6: Verify successful registration
    assert verify_dashboard_redirect(browser), "Failed to redirect to dashboard"
    assert "Welcome" in browser.page_source, "Welcome message not found"
    
    print(f"✓ Sign-up successful with email: {unique_email}")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_existing_email(browser):
    """
    Test Case 2: Sign-Up Error - Already Registered Email
    - Enter valid name
    - Enter an already registered email
    - Enter valid password
    - Verify error message appears
    """
    print("\n[TEST 2] Testing Sign-Up with Existing Email...")
    
    # First, create an account
    timestamp = int(time.time())
    existing_email = f"existing{timestamp}@example.com"
    
    navigate_to_signup(browser)
    fill_step1_account_info(
        browser,
        name="Test User",
        email=existing_email,
        password="TestPass123!",
        confirm_password="TestPass123!"
    )
    click_continue_button(browser)
    time.sleep(1)
    
    fill_step2_location_info(browser, "Metro Manila", "Manila")
    click_signup_button(browser)
    
    # Wait for dashboard
    WebDriverWait(browser, 10).until(EC.url_contains("/dashboard"))
    
    # Now try to register with the same email
    navigate_to_signup(browser)
    fill_step1_account_info(
        browser,
        name="Another User",
        email=existing_email,
        password="AnotherPass123!",
        confirm_password="AnotherPass123!"
    )
    click_continue_button(browser)
    time.sleep(1)
    
    fill_step2_location_info(browser, "Metro Manila", "Quezon City")
    click_signup_button(browser)
    time.sleep(2)
    
    # Verify error message appears
    assert check_error_message(browser), "Error message not displayed for existing email"
    print("✓ Error message displayed for existing email")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_blank_fields(browser):
    """
    Test Case 3: Sign-Up Error - Blank Fields
    - Leave Name, Email, and Password fields blank
    - Click Continue button
    - Verify validation errors appear
    """
    print("\n[TEST 3] Testing Sign-Up with Blank Fields...")
    
    # Navigate to signup page
    navigate_to_signup(browser)
    
    # Leave all fields blank and click Continue
    fill_step1_account_info(
        browser,
        name="",
        email="",
        password="",
        confirm_password=""
    )
    
    click_continue_button(browser)
    time.sleep(1)
    
    # Verify we're still on step 1 (not progressed to step 2)
    # Check if Continue button is still visible (means we didn't progress)
    try:
        continue_btn = browser.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
        assert continue_btn.is_displayed(), "Should still be on Step 1"
        print("✓ Validation prevented progression with blank fields")
    except:
        pytest.fail("Should not have progressed to Step 2 with blank fields")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_invalid_email_format(browser):
    """
    Test Case 4: Sign-Up Error - Invalid Email Format
    - Enter valid name
    - Enter invalid email format
    - Enter valid password
    - Click Continue button
    - Verify error message for invalid email
    """
    print("\n[TEST 4] Testing Sign-Up with Invalid Email Format...")
    
    # Navigate to signup page
    navigate_to_signup(browser)
    
    # Fill with invalid email format
    fill_step1_account_info(
        browser,
        name="Test User",
        email="invalidemail.com",  # Missing @
        password="TestPass123!",
        confirm_password="TestPass123!"
    )
    
    click_continue_button(browser)
    time.sleep(1)
    
    # Verify error message appears or still on step 1
    try:
        continue_btn = browser.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
        assert continue_btn.is_displayed(), "Should still be on Step 1"
        print("✓ Validation prevented progression with invalid email format")
    except:
        pytest.fail("Should not have progressed to Step 2 with invalid email")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_blank_location_fields(browser, unique_email):
    """
    Test Case 5: Sign-Up Error - Blank Location Fields
    - Enter valid Name, Email, and Password
    - Click Continue button
    - Leave Province and City fields empty
    - Click Sign Up button
    - Verify error message appears
    """
    print("\n[TEST 5] Testing Sign-Up with Blank Location Fields...")
    
    # Navigate to signup page
    navigate_to_signup(browser)
    
    # Fill Step 1 with valid data
    fill_step1_account_info(
        browser,
        name="Test User",
        email=unique_email,
        password="TestPass123!",
        confirm_password="TestPass123!"
    )
    
    # Click Continue to go to Step 2
    click_continue_button(browser)
    time.sleep(1)
    
    # Leave Province and City blank, just click Sign Up
    fill_step2_location_info(
        browser,
        province="",
        city="",
        language="en"
    )
    
    click_signup_button(browser)
    time.sleep(1)
    
    # Verify error message appears or still on step 2
    assert check_error_message(browser), "Error message should appear for blank location fields"
    print("✓ Error message displayed for blank location fields")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_mismatched_passwords(browser, unique_email):
    """
    Test Case 6: Sign-Up Error - Mismatched Passwords
    - Enter valid name and email
    - Enter password and different confirm password
    - Verify error message appears
    """
    print("\n[TEST 6] Testing Sign-Up with Mismatched Passwords...")
    
    # Navigate to signup page
    navigate_to_signup(browser)
    
    # Fill with mismatched passwords
    fill_step1_account_info(
        browser,
        name="Test User",
        email=unique_email,
        password="TestPass123!",
        confirm_password="DifferentPass123!"
    )
    
    click_continue_button(browser)
    time.sleep(1)
    
    # Verify error message appears or still on step 1
    assert check_error_message(browser), "Error message should appear for mismatched passwords"
    print("✓ Error message displayed for mismatched passwords")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_weak_password(browser, unique_email):
    """
    Test Case 7: Sign-Up Error - Weak Password
    - Enter valid name and email
    - Enter weak password (too short, no special chars)
    - Verify error message appears
    """
    print("\n[TEST 7] Testing Sign-Up with Weak Password...")
    
    # Navigate to signup page
    navigate_to_signup(browser)
    
    # Fill with weak password
    fill_step1_account_info(
        browser,
        name="Test User",
        email=unique_email,
        password="weak",
        confirm_password="weak"
    )
    
    click_continue_button(browser)
    time.sleep(1)
    
    # Verify error message appears or still on step 1
    try:
        continue_btn = browser.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
        assert continue_btn.is_displayed(), "Should still be on Step 1"
        print("✓ Validation prevented progression with weak password")
    except:
        pytest.fail("Should not have progressed to Step 2 with weak password")

# ============================================
# RUN ALL TESTS
# ============================================

if __name__ == "__main__":
    """
    Run all signup tests
    Usage: python test_signup.py
    Or use pytest: pytest test_signup.py -v
    """
    pytest.main([__file__, "-v", "--tb=short"])
