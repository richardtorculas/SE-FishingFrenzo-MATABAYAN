# MataBayan – Test Suite

## Structure

```
tests/
├── automation/
│   ├── test_landing.py   # Landing page UI tests
│   ├── test_login.py     # Login flow tests (5 cases)
│   └── test_signup.py    # Signup flow tests
└── README.md
```

## Prerequisites

- Python 3.11+
- Google Chrome (latest)
- ChromeDriver (matching Chrome version)
- Both servers running (`npm run dev` or `START.bat`)

```bash
pip install pytest selenium
```

## Running Tests

```bash
# From tests/automation/
pytest -v

# Single file
pytest test_login.py -v

# By marker
pytest -m login -v
pytest -m error -v
```

## Test Cases

### `test_login.py`
| # | Test | Marker |
|---|------|--------|
| 1 | Successful login → dashboard redirect | `login` |
| 2 | Invalid email → error message | `login`, `error` |
| 3 | Incorrect password → error message | `login`, `error` |
| 4 | Empty fields → validation blocks submit | `login`, `error` |
| 5 | Invalid email format → validation blocks submit | `login`, `error` |

### `test_signup.py`
Covers the 2-step signup flow including province/city selection.

### `test_landing.py`
Covers landing page rendering and navigation links.

## CI Integration

Automation tests run automatically in GitHub Actions after backend and frontend jobs pass.  
See [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) for the pipeline configuration.
