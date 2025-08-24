import { apiService } from './api.js';

// API Test Suite for SNK Backend Integration
export class ApiTester {
  constructor() {
    this.results = [];
    this.baseUrl = 'http://localhost:5000';
  }

  log(test, status, message, error = null) {
    this.results.push({
      test,
      status,
      message,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });
    console.log(`[${status}] ${test}: ${message}`);
    if (error) console.error(error);
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (response.ok) {
        this.log('Connection', 'PASS', 'Backend is reachable');
        return true;
      } else {
        this.log('Connection', 'FAIL', `Backend returned status ${response.status}`);
        return false;
      }
    } catch (error) {
      this.log('Connection', 'FAIL', 'Backend is not reachable', error);
      return false;
    }
  }

  async testAuthEndpoints() {
    try {
      // Test login with invalid credentials
      try {
        await apiService.login('test@test.com', 'wrongpassword');
        this.log('Auth Login (Invalid)', 'FAIL', 'Should have failed with invalid credentials');
      } catch (error) {
        this.log('Auth Login (Invalid)', 'PASS', 'Correctly rejected invalid credentials');
      }

      // Test profile without token
      try {
        localStorage.removeItem('adminToken');
        await apiService.getProfile();
        this.log('Auth Profile (No Token)', 'FAIL', 'Should have failed without token');
      } catch (error) {
        this.log('Auth Profile (No Token)', 'PASS', 'Correctly rejected request without token');
      }

    } catch (error) {
      this.log('Auth Endpoints', 'ERROR', 'Unexpected error during auth tests', error);
    }
  }

  async testPropertiesEndpoints() {
    try {
      // Test get properties (public endpoint)
      const properties = await apiService.getProperties({ limit: 5 });
      this.log('Properties GET', 'PASS', `Retrieved ${properties.properties?.length || 0} properties`);

      // Test get featured properties
      const featured = await apiService.getProperties({ isFeatured: true, limit: 3 });
      this.log('Featured Properties', 'PASS', `Retrieved ${featured.properties?.length || 0} featured properties`);

    } catch (error) {
      this.log('Properties Endpoints', 'FAIL', 'Failed to get properties', error);
    }
  }

  async testBrokersEndpoints() {
    try {
      // This requires admin auth, so it might fail
      const brokers = await apiService.getBrokers({ limit: 5 });
      this.log('Brokers GET', 'PASS', `Retrieved ${brokers.brokers?.length || 0} brokers`);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.log('Brokers GET', 'EXPECTED_FAIL', 'Requires authentication (expected without valid token)');
      } else {
        this.log('Brokers GET', 'FAIL', 'Unexpected error', error);
      }
    }
  }

  async testStatisticsEndpoints() {
    try {
      const stats = await apiService.getStatistics();
      this.log('Statistics GET', 'PASS', `Retrieved statistics: ${JSON.stringify(stats).substring(0, 100)}...`);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.log('Statistics GET', 'EXPECTED_FAIL', 'Requires authentication (expected without valid token)');
      } else {
        this.log('Statistics GET', 'FAIL', 'Unexpected error', error);
      }
    }
  }

  async runAllTests() {
    console.log('🧪 Starting API Tests for SNK Backend...');
    this.results = [];

    // Test 1: Connection
    const isConnected = await this.testConnection();
    
    if (!isConnected) {
      console.log('❌ Backend not available. Make sure SNK backend is running on http://localhost:5000');
      return this.getReport();
    }

    // Test 2: Authentication
    await this.testAuthEndpoints();

    // Test 3: Properties
    await this.testPropertiesEndpoints();

    // Test 4: Brokers (requires auth)
    await this.testBrokersEndpoints();

    // Test 5: Statistics (requires auth)
    await this.testStatisticsEndpoints();

    return this.getReport();
  }

  getReport() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const expectedFails = this.results.filter(r => r.status === 'EXPECTED_FAIL').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;

    const report = {
      summary: {
        total: this.results.length,
        passed,
        failed,
        expectedFails,
        errors,
        success: failed === 0 && errors === 0
      },
      results: this.results
    };

    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Expected Failures: ${expectedFails}`);
    console.log(`💥 Errors: ${errors}`);
    console.log(`🎯 Overall: ${report.summary.success ? 'SUCCESS' : 'ISSUES FOUND'}`);

    return report;
  }
}

// Export a ready-to-use instance
export const apiTester = new ApiTester();