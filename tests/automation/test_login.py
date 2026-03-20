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
def browser():
    """Setup and teardown browser for each test"""
    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()

@pytest.fixture
def test_user():
    """Generate unique test credentials"""
    timestamp = int(time.time())
    return {
        "email": f"logintest{timestamp}@example.com",
        "password": "LoginPass123!",
        "name": "Login Test User"
    }

@pytest.fixture
def create_test_account(browser, test_user):
    """Create a test account for login testing"""
    wait = WebDriverWait(browser, 10)
    
    # Navigate to signup
    browser.get("http://localhost:3000/signup")
    
    # Fill Step 1
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']"))).send_keys(test_user["name"])
    browser.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys(test_user["email"])
    
    password_fields = browser.find_elements(By.CSS_SELECTOR, "input[type='password']")
    password_fields[0].send_keys(test_user["password"])
    password_fields[1].send_keys(test_user["password"])
    
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue')]"))).click()
    
    # Fill Step 2
    wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, "select")))
    time.sleep(0.5)
    Select(browser.find_elements(By.TAG_NAME, "select")[0]).select_by_visible_text("Metro Manila")
    time.sleep(0.5)
    Select(browser.find_elements(By.TAG_NAME, "select")[1]).select_by_visible_text("Manila")
    
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Sign Up')]"))).click()
    wait.until(EC.url_contains("/dashboard"))
    
    return test_user

# ============================================
# HELPER FUNCTIONS
# ============================================

def navigate_to_login(driver):
    """Navigate to the login page"""
    driver.get("http://localhost:3000/login")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))

def fill_login_form(driver, email, password):
    """Fill the login form with email and password"""
    wait = WebDriverWait(driver, 10)
    
    # Enter email
    email_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    email_field.clear()
    if email:
        email_field.send_keys(email)
    
    # Enter password
    password_field = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    password_field.clear()
    if password:
        password_field.send_keys(password)

def click_login_button(driver):
    """Click the Log In button"""
    wait = WebDriverWait(driver, 10)
    login_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
    login_btn.click()

def verify_dashboard_redirect(driver):
    """Verify successful redirect to dashboard"""
    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("/dashboard"))
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Welcome')]")))
    return "/dashboard" in driver.current_url

def check_error_message(driver):
    """Check if error message is displayed"""
    try:
        wait = WebDriverWait(driver, 5)
        error_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".text-red-500, .text-red-600")))
        return error_element.is_displayed()
    except:
        return False

def verify_still_on_login_page(driver):
    """Verify user is still on login page (not redirected)"""
    return "/login" in driver.current_url

# ============================================
# TEST CASES
# ============================================

@pytest.mark.login
def test_successful_login(browser, create_test_account):
    """
    Test Case 1: Successful Login
    - Enter valid email
    - Enter correct password
    - Click Log In button
    - Verify redirect to Dashboard
    """
    print("\n[TEST 1] Testing Successful Login...")
    
    # Step 1: Navigate to login page
    navigate_to_login(browser)
    
    # Step 2: Fill login form with valid credentials
    fill_login_form(
        browser,
        email=create_test_account["email"],
        password=create_test_account["password"]
    )
    
    # Step 3: Click Log In button
    click_login_button(browser)
    
    # Step 4: Verify successful login and dashboard redirect
    assert verify_dashboard_redirect(browser), "Failed to redirect to dashboard"
    assert "Welcome" in browser.page_source, "Welcome message not found on dashboard"
    
    print(f"✓ Login successful with email: {create_test_account['email']}")

@pytest.mark.login
@pytest.mark.error
def test_login_with_invalid_email(browser, create_test_account):
    """
    Test Case 2: Login Error - Invalid Email
    - Enter invalid/non-existent email
    - Enter password
    - Click Log In button
    - Verify error message appears
    """
    print("\n[TEST 2] Testing Login with Invalid Email...")
    
    # Step 1: Navigate to login page
    navigate_to_login(browser)
    
    # Step 2: Fill login form with invalid email
    fill_login_form(
        browser,
        email="nonexistent@example.com",
        password="SomePassword123!"
    )
    
    # Step 3: Click Log In button
    click_login_button(browser)
    time.sleep(2)
    
    # Step 4: Verify error message appears and still on login page
    assert verify_still_on_login_page(browser), "Should remain on login page"
    assert check_error_message(browser), "Error message should be displayed"
    
    print("✓ Error message displayed for invalid email")

@pytest.mark.login
@pytest.mark.error
def test_login_with_incorrect_password(browser, create_test_account):
    """
    Test Case 3: Login Error - Incorrect Password
    - Enter valid email
    - Enter incorrect password
    - Click Log In button
    - Verify error message appears
    """
    print("\n[TEST 3] Testing Login with Incorrect Password...")
    
    # Step 1: Navigate to login page
    navigate_to_login(browser)
    
    # Step 2: Fill login form with valid email but wrong password
    fill_login_form(
        browser,
        email=create_test_account["email"],
        password="WrongPassword123!"
    )
    
    # Step 3: Click Log In button
    click_login_button(browser)
    time.sleep(2)
    
    # Step 4: Verify error message appears and still on login page
    assert verify_still_on_login_page(browser), "Should remain on login page"
    assert check_error_message(browser), "Error message should be displayed"
    
    print("✓ Error message displayed for incorrect password")

@pytest.mark.login
@pytest.mark.error
def test_login_with_empty_fields(browser):
    """
    Test Case 4: Login Error - Empty Fields
    - Leave email and password fields empty
    - Click Log In button
    - Verify validation prevents submission
    """
    print("\n[TEST 4] Testing Login with Empty Fields...")
    
    # Step 1: Navigate to login page
    navigate_to_login(browser)
    
    # Step 2: Leave fields empty
    fill_login_form(
        browser,
        email="",
        password=""
    )
    
    # Step 3: Click Log In button
    click_login_button(browser)
    time.sleep(1)
    
    # Step 4: Verify still on login page (HTML5 validation should prevent submission)
    assert verify_still_on_login_page(browser), "Should remain on login page"
    
    print("✓ Validation prevented login with empty fields")

@pytest.mark.login
@pytest.mark.error
def test_login_with_invalid_email_format(browser):
    """
    Test Case 5: Login Error - Invalid Email Format
    - Enter invalid email format (no @)
    - Enter password
    - Click Log In button
    - Verify validation error
    """
    print("\n[TEST 5] Testing Login with Invalid Email Format...")
    
    # Step 1: Navigate to login page
    navigate_to_login(browser)
    
    # Step 2: Fill with invalid email format
    fill_login_form(
        browser,
        email="invalidemail.com",  # Missing @
        password="SomePassword123!"
    )
    
    # Step 3: Click Log In button
    click_login_button(browser)
    time.sleep(1)
    
    # Step 4: Verify still on login page
    assert verify_still_on_login_page(browser), "Should remain on login page"
    
    print("✓ Validation prevented login with invalid email format")

# ============================================
# RUN ALL TESTS
# ============================================

if __name__ == "__main__":
    """
    Run all login tests
    Usage: python test_login.py
    Or use pytest: pytest test_login.py -v
    """
    pytest.main([__file__, "-v", "--tb=short"])
