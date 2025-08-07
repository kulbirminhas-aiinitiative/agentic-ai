#!/usr/bin/env node
/**
 * Frontend Navigation and UI Testing Script for Agentic AI Platform
 * Tests all navigation, buttons, selections, and UI interactions
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class FrontendTester {
    constructor(baseUrl = 'http://localhost:3001') {
        this.baseUrl = baseUrl;
        this.browser = null;
        this.page = null;
        this.testResults = [];
    }

    async initialize() {
        console.log('🚀 Initializing Frontend Testing...');
        this.browser = await puppeteer.launch({ 
            headless: false, // Set to true for headless testing
            slowMo: 100 // Slow down by 100ms for visibility
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1366, height: 768 });
    }

    logTest(testName, success, message = '', screenshot = null) {
        const status = success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${testName}: ${message}`);
        
        this.testResults.push({
            test: testName,
            success,
            message,
            screenshot,
            timestamp: new Date().toISOString()
        });
    }

    async takeScreenshot(name) {
        const filename = `screenshots/${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
        await fs.mkdir('screenshots', { recursive: true });
        await this.page.screenshot({ path: filename });
        return filename;
    }

    async testPageLoad(pagePath, expectedTitle) {
        try {
            await this.page.goto(`${this.baseUrl}${pagePath}`, { 
                waitUntil: 'networkidle0',
                timeout: 10000 
            });
            
            const title = await this.page.title();
            const url = this.page.url();
            
            if (title && url.includes(pagePath)) {
                this.logTest(`Page Load: ${pagePath}`, true, `Title: "${title}"`);
                return true;
            } else {
                const screenshot = await this.takeScreenshot(`page_load_fail_${pagePath}`);
                this.logTest(`Page Load: ${pagePath}`, false, `Title: "${title}", URL: ${url}`, screenshot);
                return false;
            }
        } catch (error) {
            const screenshot = await this.takeScreenshot(`page_load_error_${pagePath}`);
            this.logTest(`Page Load: ${pagePath}`, false, `Error: ${error.message}`, screenshot);
            return false;
        }
    }

    async testNavigation() {
        console.log('\n🧭 Testing Navigation...');
        
        const navigationItems = [
            { path: '/', name: 'Home' },
            { path: '/dashboard', name: 'Dashboard' },
            { path: '/agents', name: 'My Agents' },
            { path: '/create-agent', name: 'Create Agent' },
            { path: '/chat', name: 'Chat' }
        ];

        for (const item of navigationItems) {
            await this.testPageLoad(item.path, item.name);
            await this.page.waitForTimeout(1000); // Wait between page loads
        }

        // Test navigation clicks
        await this.page.goto(this.baseUrl);
        
        try {
            // Test navigation menu items
            const navItems = await this.page.$$('.nav-item');
            if (navItems.length > 0) {
                this.logTest('Navigation Menu Present', true, `Found ${navItems.length} navigation items`);
            } else {
                this.logTest('Navigation Menu Present', false, 'No navigation items found');
            }

            // Test mobile menu toggle
            const mobileToggle = await this.page.$('.mobile-toggle');
            if (mobileToggle) {
                await mobileToggle.click();
                await this.page.waitForTimeout(500);
                this.logTest('Mobile Menu Toggle', true, 'Mobile menu toggle works');
            }

        } catch (error) {
            const screenshot = await this.takeScreenshot('navigation_error');
            this.logTest('Navigation Testing', false, `Error: ${error.message}`, screenshot);
        }
    }

    async testHomePage() {
        console.log('\n🏠 Testing Home Page...');
        
        await this.page.goto(this.baseUrl);
        
        try {
            // Test main elements
            const mainTitle = await this.page.$('h1');
            if (mainTitle) {
                const titleText = await this.page.evaluate(el => el.textContent, mainTitle);
                this.logTest('Home Page Title', true, `Found title: "${titleText}"`);
            } else {
                this.logTest('Home Page Title', false, 'No main title found');
            }

            // Test "View agents" button
            const viewAgentsBtn = await this.page.$('.view-profile-btn');
            if (viewAgentsBtn) {
                await viewAgentsBtn.click();
                await this.page.waitForTimeout(2000);
                const currentUrl = this.page.url();
                if (currentUrl.includes('/dashboard')) {
                    this.logTest('View Agents Button', true, 'Redirected to dashboard');
                } else {
                    this.logTest('View Agents Button', false, `Unexpected redirect: ${currentUrl}`);
                }
            } else {
                this.logTest('View Agents Button', false, 'Button not found');
            }

        } catch (error) {
            const screenshot = await this.takeScreenshot('home_page_error');
            this.logTest('Home Page Testing', false, `Error: ${error.message}`, screenshot);
        }
    }

    async testDashboard() {
        console.log('\n📊 Testing Dashboard...');
        
        await this.page.goto(`${this.baseUrl}/dashboard`);
        
        try {
            // Test dashboard cards
            const statCards = await this.page.$$('.stat-card');
            if (statCards.length >= 4) {
                this.logTest('Dashboard Stat Cards', true, `Found ${statCards.length} stat cards`);
            } else {
                this.logTest('Dashboard Stat Cards', false, `Expected 4+ cards, found ${statCards.length}`);
            }

            // Test quick actions
            const quickActions = await this.page.$$('.action-item');
            if (quickActions.length > 0) {
                this.logTest('Dashboard Quick Actions', true, `Found ${quickActions.length} quick actions`);
                
                // Test Create Agent action
                const createAgentAction = await this.page.$('a[href="/create-agent"]');
                if (createAgentAction) {
                    await createAgentAction.click();
                    await this.page.waitForTimeout(2000);
                    const currentUrl = this.page.url();
                    if (currentUrl.includes('/create-agent')) {
                        this.logTest('Create Agent Quick Action', true, 'Navigation successful');
                    } else {
                        this.logTest('Create Agent Quick Action', false, `Unexpected URL: ${currentUrl}`);
                    }
                }
            } else {
                this.logTest('Dashboard Quick Actions', false, 'No quick actions found');
            }

        } catch (error) {
            const screenshot = await this.takeScreenshot('dashboard_error');
            this.logTest('Dashboard Testing', false, `Error: ${error.message}`, screenshot);
        }
    }

    async testAgentsPage() {
        console.log('\n🤖 Testing Agents Page...');
        
        await this.page.goto(`${this.baseUrl}/agents`);
        
        try {
            // Wait for content to load
            await this.page.waitForSelector('.agents-main', { timeout: 5000 });

            // Test agents grid
            const agentsGrid = await this.page.$('.agents-grid');
            if (agentsGrid) {
                this.logTest('Agents Grid Present', true, 'Agents grid found');
            } else {
                this.logTest('Agents Grid Present', false, 'Agents grid not found');
            }

            // Test loading state
            const loadingState = await this.page.$('.loading-state');
            if (loadingState) {
                this.logTest('Agents Loading State', true, 'Loading state displayed');
            }

            // Test stats row
            const statsRow = await this.page.$('.stats-row');
            if (statsRow) {
                const statCards = await this.page.$$('.stat-card');
                this.logTest('Agents Stats', true, `Found ${statCards.length} stat cards`);
            }

        } catch (error) {
            const screenshot = await this.takeScreenshot('agents_page_error');
            this.logTest('Agents Page Testing', false, `Error: ${error.message}`, screenshot);
        }
    }

    async testCreateAgentPage() {
        console.log('\n➕ Testing Create Agent Page...');
        
        await this.page.goto(`${this.baseUrl}/create-agent`);
        
        try {
            // Wait for form to load
            await this.page.waitForSelector('.create-agent-container', { timeout: 5000 });

            // Test form elements
            const agentNameInput = await this.page.$('input[name="name"]');
            const descriptionInput = await this.page.$('textarea[name="description"]');
            const createButton = await this.page.$('button[type="submit"]');

            if (agentNameInput && descriptionInput && createButton) {
                this.logTest('Create Agent Form', true, 'All form elements present');

                // Test form interaction
                await this.page.type('input[name="name"]', 'Test Agent UI');
                await this.page.type('textarea[name="description"]', 'Test agent created via UI testing');

                // Test RAG architecture selection
                const ragSelect = await this.page.$('select[name="rag_architecture"]');
                if (ragSelect) {
                    await this.page.select('select[name="rag_architecture"]', 'llamaindex-pinecone');
                    this.logTest('RAG Architecture Selection', true, 'Selection works');
                }

                this.logTest('Create Agent Form Interaction', true, 'Form inputs working');
            } else {
                this.logTest('Create Agent Form', false, 'Missing form elements');
            }

        } catch (error) {
            const screenshot = await this.takeScreenshot('create_agent_error');
            this.logTest('Create Agent Testing', false, `Error: ${error.message}`, screenshot);
        }
    }

    async testChatPage() {
        console.log('\n💬 Testing Chat Page...');
        
        await this.page.goto(`${this.baseUrl}/chat`);
        
        try {
            // Wait for potential redirect or content load
            await this.page.waitForTimeout(3000);
            
            const currentUrl = this.page.url();
            
            if (currentUrl.includes('/chat/')) {
                this.logTest('Chat Page Redirect', true, 'Redirected to specific chat');
            } else if (currentUrl.includes('/chat')) {
                this.logTest('Chat Page Load', true, 'Chat page loaded');
            } else {
                this.logTest('Chat Page Navigation', false, `Unexpected URL: ${currentUrl}`);
            }

            // Test chat interface elements
            const chatContainer = await this.page.$('.chat-container');
            if (chatContainer) {
                this.logTest('Chat Interface', true, 'Chat container present');
            }

        } catch (error) {
            const screenshot = await this.takeScreenshot('chat_page_error');
            this.logTest('Chat Page Testing', false, `Error: ${error.message}`, screenshot);
        }
    }

    async testFooter() {
        console.log('\n🦶 Testing Footer...');
        
        await this.page.goto(this.baseUrl);
        
        try {
            // Scroll to footer
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            await this.page.waitForTimeout(1000);

            const footer = await this.page.$('.modern-footer');
            if (footer) {
                this.logTest('Footer Present', true, 'Footer found');

                // Test footer links
                const footerLinks = await this.page.$$('.footer-link');
                if (footerLinks.length > 0) {
                    this.logTest('Footer Links', true, `Found ${footerLinks.length} footer links`);
                } else {
                    this.logTest('Footer Links', false, 'No footer links found');
                }

                // Test system status in footer
                const systemStatus = await this.page.$('.status-indicator');
                if (systemStatus) {
                    this.logTest('Footer System Status', true, 'System status indicator present');
                }

            } else {
                this.logTest('Footer Present', false, 'Footer not found');
            }

        } catch (error) {
            const screenshot = await this.takeScreenshot('footer_error');
            this.logTest('Footer Testing', false, `Error: ${error.message}`, screenshot);
        }
    }

    async testResponsiveDesign() {
        console.log('\n📱 Testing Responsive Design...');
        
        const viewports = [
            { width: 1920, height: 1080, name: 'Desktop' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 375, height: 667, name: 'Mobile' }
        ];

        for (const viewport of viewports) {
            try {
                await this.page.setViewport(viewport);
                await this.page.goto(this.baseUrl);
                await this.page.waitForTimeout(1000);

                const screenshot = await this.takeScreenshot(`responsive_${viewport.name.toLowerCase()}`);
                this.logTest(`Responsive Design: ${viewport.name}`, true, 
                    `${viewport.width}x${viewport.height}`, screenshot);

            } catch (error) {
                this.logTest(`Responsive Design: ${viewport.name}`, false, `Error: ${error.message}`);
            }
        }

        // Reset to default viewport
        await this.page.setViewport({ width: 1366, height: 768 });
    }

    async testAccessibility() {
        console.log('\n♿ Testing Basic Accessibility...');
        
        await this.page.goto(this.baseUrl);
        
        try {
            // Test for alt text on images
            const images = await this.page.$$('img');
            let imagesWithAlt = 0;
            for (const img of images) {
                const alt = await img.evaluate(el => el.getAttribute('alt'));
                if (alt) imagesWithAlt++;
            }
            
            if (images.length === 0 || imagesWithAlt === images.length) {
                this.logTest('Image Alt Text', true, `${imagesWithAlt}/${images.length} images have alt text`);
            } else {
                this.logTest('Image Alt Text', false, `Only ${imagesWithAlt}/${images.length} images have alt text`);
            }

            // Test for heading structure
            const headings = await this.page.$$('h1, h2, h3, h4, h5, h6');
            if (headings.length > 0) {
                this.logTest('Heading Structure', true, `Found ${headings.length} headings`);
            } else {
                this.logTest('Heading Structure', false, 'No headings found');
            }

            // Test for focus indicators
            const focusableElements = await this.page.$$('button, a, input, select, textarea');
            if (focusableElements.length > 0) {
                this.logTest('Focusable Elements', true, `Found ${focusableElements.length} focusable elements`);
            }

        } catch (error) {
            this.logTest('Accessibility Testing', false, `Error: ${error.message}`);
        }
    }

    async runCompleteTestSuite() {
        console.log('🧪 Starting Complete Frontend Testing Suite...');
        console.log('=' .repeat(60));

        try {
            await this.initialize();

            // Run all tests
            await this.testNavigation();
            await this.testHomePage();
            await this.testDashboard();
            await this.testAgentsPage();
            await this.testCreateAgentPage();
            await this.testChatPage();
            await this.testFooter();
            await this.testResponsiveDesign();
            await this.testAccessibility();

        } catch (error) {
            console.error('❌ Test suite error:', error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }

        return this.generateSummary();
    }

    generateSummary() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        console.log('\n' + '='.repeat(60));
        console.log('📊 FRONTEND TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`📈 Success Rate: ${totalTests > 0 ? (passedTests/totalTests*100).toFixed(1) : 0}%`);

        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.filter(r => !r.success).forEach(result => {
                console.log(`   - ${result.test}: ${result.message}`);
            });
        }

        const summary = {
            total_tests: totalTests,
            passed_tests: passedTests,
            failed_tests: failedTests,
            success_rate: totalTests > 0 ? (passedTests/totalTests*100) : 0,
            detailed_results: this.testResults
        };

        // Save results
        fs.writeFile('frontend_test_results.json', JSON.stringify(summary, null, 2))
            .then(() => console.log('\n💾 Frontend test results saved to: frontend_test_results.json'))
            .catch(err => console.error('Error saving results:', err));

        return summary;
    }
}

async function main() {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    console.log(`🌐 Frontend URL: ${frontendUrl}`);

    const tester = new FrontendTester(frontendUrl);
    const summary = await tester.runCompleteTestSuite();

    if (summary.failed_tests > 0) {
        console.log('\n🚨 Some frontend tests failed. Please check the issues above.');
        process.exit(1);
    } else {
        console.log('\n🎉 All frontend tests passed successfully!');
        process.exit(0);
    }
}

if (require.main === module) {
    main().catch(console.error);
}
