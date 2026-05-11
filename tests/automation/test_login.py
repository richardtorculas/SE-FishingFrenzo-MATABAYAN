import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def navigate_to_login(driver):
    driver.get("http://localhost:3000/login")
    wait = WebDriverWait(driver, 20)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))

def fill_login_form(driver, email, password):
    wait = WebDriverWait(driver, 20)
    email_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    email_field.clear()
    if email:
        email_field.send_keys(email)
    password_field = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    password_field.clear()
    if password:
        password_field.send_keys(password)

def click_login_button(driver):
    wait = WebDriverWait(driver, 20)
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))).click()

def verify_still_on_login_page(driver):
    return "/login" in driver.current_url

@pytest.mark.login
@pytest.mark.error
def test_login_with_empty_fields(browser):
    print("\n[TEST 4] Testing Login with Empty Fields...")
    navigate_to_login(browser)
    fill_login_form(browser, email="", password="")
    click_login_button(browser)
    time.sleep(1)
    assert verify_still_on_login_page(browser), "Should remain on login page"
    print("✓ Validation prevented login with empty fields")

@pytest.mark.login
@pytest.mark.error
def test_login_with_invalid_email_format(browser):
    print("\n[TEST 5] Testing Login with Invalid Email Format...")
    navigate_to_login(browser)
    fill_login_form(browser, email="invalidemail.com", password="SomePassword123!")
    click_login_button(browser)
    time.sleep(1)
    assert verify_still_on_login_page(browser), "Should remain on login page"
    print("✓ Validation prevented login with invalid email format")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
