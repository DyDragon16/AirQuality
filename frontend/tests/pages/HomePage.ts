import { Page } from "@playwright/test";
import * as fs from 'fs';

export class HomePage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Các phương thức điều hướng
    async goto() {
        await this.page.goto("/");
    }

    async waitForLoad() {
        await this.page.waitForTimeout(2000);
    }

    // Các phương thức tìm kiếm
    async searchFor(text: string) {
        const searchInput = this.page.locator('input[type="text"][placeholder*="tìm kiếm" i], input[placeholder*="search" i], input[aria-label*="search" i], input[aria-label*="tìm kiếm" i]').first();
        await searchInput.click();
        await searchInput.fill(text);
        await this.page.waitForTimeout(2000);
    }

    async clickSearchButton() {
        // Tìm nút "Tìm kiếm" với nhiều selector khác nhau
        const searchButton = this.page.locator([
            'button:has-text("Tìm kiếm")',
            'button.search-button',
            'button[type="submit"]:near(input[type="text"])',
            '.search-form button',
            'form button[type="submit"]',
            'button.btn-search',
            'button.btn-primary:near(input[type="text"])'
        ].join(', ')).first();

        // Click vào nút tìm kiếm
        await searchButton.click();
        
        // Đợi chuyển trang
        await this.page.waitForTimeout(3000);
    }

    async checkCityDetailPage(cityName: string) {
        // Đợi để đảm bảo trang đã load xong
        await this.page.waitForTimeout(2000);

        // Kiểm tra URL chứa tên thành phố hoặc các pattern phổ biến của URL chi tiết
        const currentUrl = this.page.url().toLowerCase();
        const normalizedCityName = cityName.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')  // Loại bỏ dấu
            .replace(/đ/g, 'd')               // Chuyển đổi đ thành d
            .replace(/\s+/g, '-');            // Chuyển khoảng trắng thành dấu gạch ngang
        
        const validUrlPatterns = [
            normalizedCityName,
            `city/${normalizedCityName}`,
            `cities/${normalizedCityName}`,
            `detail/${normalizedCityName}`,
            `air-quality/${normalizedCityName}`
        ];

        const isValidUrl = validUrlPatterns.some(pattern => currentUrl.includes(pattern));
        if (!isValidUrl) {
            console.log('Current URL:', currentUrl);
            console.log('Expected patterns:', validUrlPatterns);
            throw new Error(`URL không chứa tên thành phố "${cityName}" hoặc không đúng định dạng trang chi tiết`);
        }
    }

    async getAutocompleteResults() {
        return this.page.locator('.autocomplete-results, .search-suggestions, [role="listbox"], .dropdown-menu').first();
    }

    // Các phương thức điều hướng menu
    async clickAirQualityLink() {
        const airQualityLink = this.page.locator('nav a:has-text("Chất lượng không khí"), header a:has-text("Chất lượng không khí"), .navbar a:has-text("Chất lượng không khí")').first();
        await airQualityLink.click();
        await this.page.waitForTimeout(2000);
    }

    // Các phương thức tương tác với bản đồ
    async getMapElement() {
        return this.page.locator('.map-container, #map, .air-quality-map, iframe[src*="map"], .leaflet-container, .map, [role="region"][aria-label*="map"]').first();
    }

    async clickZoomOut() {
        // Đợi cho bản đồ load xong và có thể tương tác
        await this.page.waitForTimeout(3000);

        // Tìm nút zoom out với nhiều selector khác nhau
        const zoomOutButton = this.page.locator([
            'button[aria-label="Zoom out"]',
            '.leaflet-control-zoom-out',
            'button[title="Zoom out"]',
            '.map button:has-text("-")',
            '[role="button"]:has-text("-"):not([disabled])',
            '.zoom-out-button:not([disabled])'
        ].join(', ')).first();

        // Đợi cho nút zoom out có thể click được
        await this.page.waitForLoadState('networkidle');
        await zoomOutButton.waitFor({ state: 'visible', timeout: 10000 });

        // Click zoom out từng lần một và đợi bản đồ cập nhật
        for (let i = 0; i < 3; i++) {
            try {
                await zoomOutButton.click({ timeout: 5000 });
                console.log(`Click zoom out lần ${i + 1} thành công`);
                // Đợi bản đồ cập nhật sau mỗi lần zoom
                await this.page.waitForTimeout(2000);
            } catch (error) {
                console.log(`Không thể click zoom out lần ${i + 1}:`, error);
                break;
            }
        }

        // Đợi bản đồ cập nhật hoàn toàn
        await this.page.waitForTimeout(5000);
    }

    async captureMapScreenshot(fileName: string) {
        try {
            // Đợi bản đồ và các marker hiển thị
            await this.page.waitForSelector('.leaflet-container', { state: 'visible', timeout: 10000 });
            await this.page.waitForSelector('.leaflet-marker-icon', { state: 'visible', timeout: 10000 });
            
            // Đợi thêm thời gian để bản đồ cập nhật hoàn toàn
            await this.page.waitForTimeout(3000);

            // Đảm bảo thư mục screenshots tồn tại
            const dir = 'tests/screenshots';
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }

            // Chụp ảnh toàn bộ trang
            await this.page.screenshot({
                path: `${dir}/${fileName}`,
                fullPage: true,
                timeout: 10000
            });
            console.log(`Đã chụp ảnh bản đồ thành công: ${fileName}`);
        } catch (error) {
            console.error(`Lỗi khi chụp ảnh bản đồ ${fileName}:`, error);
            throw error;
        }
    }

    // Các phương thức chụp ảnh
    async captureScreenshot(fileName: string) {
        try {
            // Đảm bảo thư mục screenshots tồn tại
            const dir = 'tests/screenshots';
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }

            // Chụp ảnh với timeout dài hơn
            await this.page.screenshot({
                path: `${dir}/${fileName}`,
                fullPage: true,
                timeout: 10000
            });
            console.log(`Đã chụp ảnh thành công: ${fileName}`);
        } catch (error) {
            console.error(`Lỗi khi chụp ảnh ${fileName}:`, error);
            throw error;
        }
    }
} 