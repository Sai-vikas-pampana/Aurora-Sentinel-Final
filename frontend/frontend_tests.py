import pytest
import time
from playwright.sync_api import sync_playwright

# 🏛️ END-TO-END: Dashboard Kinetic Verification
# Industry Requirement: Visual & Functional Consistency

def perform_dashboard_login(page):
    # Industry Standard: Secure Auth Handshake
    page.goto("http://127.0.0.1:3000")
    page.get_by_placeholder("OPERATOR_ID").fill("admin")
    page.get_by_placeholder("ACCESS_KEY").fill("sentinel2024")
    page.get_by_role("button", name="Authorize Node Connection").click()
    # Wait for Dashboard Handover
    page.wait_for_selector(".animate-pulse", timeout=15000)

def test_dashboard_landing_visibility():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        perform_dashboard_login(page)
        
        # Verify Brand Integrity (Case-Insensitive)
        title = page.locator("h1")
        title_text = title.inner_text().upper()
        assert "AURORA SENTINEL" in title_text
        assert "ENTERPRISE" in title_text
        
        # Verify Connection Indicator
        status = page.locator(".text-emerald-400")
        # Retry connection if offline (Wait for WebSocket handshaking)
        page.wait_for_selector(".animate-pulse", timeout=10000)
        assert status.count() > 0
        
        browser.close()

def test_signal_inflow_and_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        perform_dashboard_login(page)
        
        # Wait for the first Alpha Stream card to appear
        page.wait_for_selector(".group.hover\\:border-white\\/10", timeout=15000)
        
        # Verify Signal Content (User, Topic, Text)
        first_post = page.locator(".group.hover\\:border-white\\/10").first
        username = first_post.locator(".font-black")
        assert "@" in username.inner_text()
        
        # Verify Audit Telemetry (L1/L2 bars)
        # Using attribute contains selector for robust matching of Tailwind slashes
        l1_bar = first_post.locator("div[class*='bg-indigo-500/50']").first
        page.wait_for_selector("div[class*='bg-indigo-500/50']", timeout=20000)
        width = l1_bar.evaluate("node => node.style.width")
        assert "%" in width
        
        browser.close()

def test_purge_intelligence_button():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        perform_dashboard_login(page)
        
        # Wait for stream data
        page.wait_for_selector(".group.hover\\:border-white\\/10", timeout=10000)
        
        # Trigger Purge (Industry Requirement: Functional Integrity)
        purge_btn = page.get_by_role("button", name="Global Intelligence Purge")
        purge_btn.click()
        
        # Verify state is cleared immediately
        posts_count = page.locator(".group.hover\\:border-white\\/10").count()
        assert posts_count == 0
        
        browser.close()

def test_trending_vectors_momentum():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        perform_dashboard_login(page)
        
        # Verify Analytics Convergence (Should show data-driven Pulses)
        page.wait_for_selector("text=Pulses", timeout=15000)
        
        first_vector = page.locator("text=Pulses").first
        assert "Pulses" in first_vector.inner_text()
        
        browser.close()
