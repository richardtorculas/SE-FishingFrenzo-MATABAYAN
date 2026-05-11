import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time

@pytest.fixture
def unique_email():
    timestamp = int(time.time())
    return f"testuser{timestamp}@example.com"

def navigate_to_signup(driver):
    driver.get("http://localhost:3000/signup")
    wait = WebDriverWait(driver, 20)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']")))

def fill_step1_account_info(driver, name, email, password, confirm_password):
    wait = WebDriverWait(driver, 20)
    name_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']")))
    name_field.clear()
    if name:
        name_field.send_keys(name)
    email_field = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
    email_field.clear()
    if email:
        email_field.send_keys(email)
    password_fields = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
    password_fields[0].clear()
    if password:
        password_fields[0].send_keys(password)
    password_fields[1].clear()
    if confirm_password:
        password_fields[1].send_keys(confirm_password)

def click_continue_button(driver):
    wait = WebDriverWait(driver, 20)
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue')]"))).click()

def fill_step2_location_info(driver, province, city, language="en"):
    wait = WebDriverWait(driver, 20)
    wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, "select")))
    time.sleep(1)
    if province:
        Select(driver.find_elements(By.TAG_NAME, "select")[0]).select_by_visible_text(province)
        time.sleep(0.5)
    if city:
        Select(driver.find_elements(By.TAG_NAME, "select")[1]).select_by_visible_text(city)
    if language == "fil":
        driver.find_element(By.CSS_SELECTOR, "input[value='fil']").click()

def check_error_message(driver):
    try:
        el = driver.find_element(By.CSS_SELECTOR, ".text-red-500, .text-red-600")
        return el.is_displayed()
    except:
        return False

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_blank_fields(browser):
    print("\n[TEST 3] Testing Sign-Up with Blank Fields...")
    navigate_to_signup(browser)
    fill_step1_account_info(browser, name="", email="", password="", confirm_password="")
    click_continue_button(browser)
    time.sleep(1)
    try:
        btn = browser.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
        assert btn.is_displayed()
        print("✓ Validation prevented progression with blank fields")
    except:
        pytest.fail("Should not have progressed to Step 2 with blank fields")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_invalid_email_format(browser):
    print("\n[TEST 4] Testing Sign-Up with Invalid Email Format...")
    navigate_to_signup(browser)
    fill_step1_account_info(browser, name="Test User", email="invalidemail.com", password="TestPass123!", confirm_password="TestPass123!")
    click_continue_button(browser)
    time.sleep(1)
    try:
        btn = browser.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
        assert btn.is_displayed()
        print("✓ Validation prevented progression with invalid email format")
    except:
        pytest.fail("Should not have progressed to Step 2 with invalid email")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_blank_location_fields(browser, unique_email):
    print("\n[TEST 5] Testing Sign-Up with Blank Location Fields...")
    navigate_to_signup(browser)
    fill_step1_account_info(browser, name="Test User", email=unique_email, password="TestPass123!", confirm_password="TestPass123!")
    click_continue_button(browser)
    time.sleep(1)
    fill_step2_location_info(browser, province="", city="", language="en")
    wait = WebDriverWait(browser, 10)
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue')]"))).click()
    time.sleep(1)
    assert check_error_message(browser), "Error message should appear for blank location fields"
    print("✓ Error message displayed for blank location fields")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_mismatched_passwords(browser, unique_email):
    print("\n[TEST 6] Testing Sign-Up with Mismatched Passwords...")
    navigate_to_signup(browser)
    fill_step1_account_info(browser, name="Test User", email=unique_email, password="TestPass123!", confirm_password="DifferentPass123!")
    click_continue_button(browser)
    time.sleep(1)
    assert check_error_message(browser), "Error message should appear for mismatched passwords"
    print("✓ Error message displayed for mismatched passwords")

@pytest.mark.signup
@pytest.mark.error
def test_signup_with_weak_password(browser, unique_email):
    print("\n[TEST 7] Testing Sign-Up with Weak Password...")
    navigate_to_signup(browser)
    fill_step1_account_info(browser, name="Test User", email=unique_email, password="weak", confirm_password="weak")
    click_continue_button(browser)
    time.sleep(1)
    try:
        btn = browser.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
        assert btn.is_displayed()
        print("✓ Validation prevented progression with weak password")
    except:
        pytest.fail("Should not have progressed to Step 2 with weak password")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
