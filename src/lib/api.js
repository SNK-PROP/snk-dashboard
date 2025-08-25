import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get(url, config = {}) {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post(url, data, config = {}) {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put(url, data, config = {}) {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async delete(url, config = {}) {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // Authentication
  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Users Management (Note: Backend doesn't have dedicated user management routes)
  async getUsers(params = {}) {
    // Fallback: Get users from brokers endpoint
    try {
      const brokersResponse = await this.api.get('/brokers', { params });
      const users = brokersResponse.data.brokers?.map(broker => ({
        ...broker,
        userType: broker.userType || 'broker',
        verificationStatus: broker.verificationStatus || 'pending'
      })) || [];
      
      return {
        users: users,
        pagination: brokersResponse.data.pagination || {
          current: 1, pages: 1, total: users.length, hasNext: false, hasPrev: false
        }
      };
    } catch (error) {
      console.warn('Users endpoint not available, using empty data');
      return { users: [], pagination: { current: 1, pages: 1, total: 0 } };
    }
  }

  async getUserById(id) {
    // Try to get broker by ID first
    try {
      const response = await this.api.get(`/brokers/${id}`);
      return { user: response.data.broker };
    } catch (error) {
      console.warn(`User ${id} not found in brokers`);
      return { user: null };
    }
  }

  async updateUserStatus(id, status) {
    // This functionality is not available in backend
    console.warn('updateUserStatus not implemented in backend');
    return { message: 'Status update not available' };
  }

  async verifyUser(id, verificationData) {
    // Use broker verification endpoint if user is a broker
    try {
      const response = await this.api.put(`/brokers/${id}/verify`, verificationData);
      return response.data;
    } catch (error) {
      console.warn('User verification not available for regular users');
      return { message: 'Verification not available for this user type' };
    }
  }

  // Properties Management
  async getProperties(params = {}) {
    const response = await this.api.get('/properties', { params });
    const data = response.data;
    
    // Transform backend data structure to match dashboard expectations
    if (data.properties) {
      data.properties = data.properties.map(property => ({
        ...property,
        // Ensure consistent field names for dashboard
        id: property._id,
        contactNumber: property.brokerContact || property.contactNumber || 'N/A',
        // Handle nested broker data properly
        brokerId: property.brokerId?._id || property.brokerId,
        brokerName: property.brokerName || property.brokerId?.fullName || 'Unknown Broker',
        brokerContact: property.brokerContact || property.brokerId?.contactNumber || 'N/A',
        // Standardize location data
        city: property.location?.city || 'City not specified',
        state: property.location?.state || 'State not specified',
        address: property.location?.address || 'Address not provided',
        // Ensure price formatting
        price: parseFloat(property.price) || 0,
        // Convert dates for display
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        // Status standardization
        status: property.status || 'Active',
        isFeatured: Boolean(property.isFeatured)
      }));
    }
    
    return data;
  }

  async getPropertyById(id) {
    const response = await this.api.get(`/properties/${id}`);
    return response.data;
  }

  async updatePropertyStatus(id, status) {
    const response = await this.api.put(`/properties/${id}`, { status });
    return response.data;
  }

  async toggleFeaturedProperty(id, isFeatured) {
    const response = await this.api.put(`/properties/${id}`, { isFeatured });
    return response.data;
  }

  async deleteProperty(id) {
    const response = await this.api.delete(`/properties/${id}`);
    return response.data;
  }

  // Brokers Management
  async getBrokers(params = {}) {
    try {
      const response = await this.api.get('/brokers', { params });
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        // Broker doesn't have admin access - return limited data
        console.warn('Broker access limited for brokers endpoint');
        return { 
          brokers: [], 
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          message: 'Limited access: Admin privileges required for full broker data'
        };
      }
      throw error;
    }
  }

  async getBrokerById(id) {
    const response = await this.api.get(`/brokers/${id}`);
    return response.data;
  }

  async verifyBroker(id, verificationData) {
    const response = await this.api.put(`/brokers/${id}/verify`, verificationData);
    return response.data;
  }

  async getSubBrokers(brokerId) {
    const response = await this.api.get(`/brokers/${brokerId}/sub-brokers`);
    return response.data;
  }

  // Employees Management
  async getEmployees(params = {}) {
    try {
      const response = await this.api.get('/employees', { params });
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        console.warn('Admin access required for employees endpoint');
        return { 
          employees: [], 
          pagination: { current: 1, pages: 1, total: 0 },
          message: 'Admin privileges required for employee data'
        };
      }
      throw error;
    }
  }

  async getEmployeeById(id) {
    const response = await this.api.get(`/employees/${id}`);
    return response.data;
  }

  async createEmployee(employeeData) {
    const response = await this.api.post('/employees', employeeData);
    return response.data;
  }

  async updateEmployee(id, employeeData) {
    const response = await this.api.put(`/employees/${id}`, employeeData);
    return response.data;
  }

  async deleteEmployee(id) {
    const response = await this.api.delete(`/employees/${id}`);
    return response.data;
  }

  async getEmployeeDashboard() {
    const response = await this.api.get('/employees/dashboard/stats');
    return response.data;
  }

  async getReferralStats(params = {}) {
    const response = await this.api.get('/employees/stats/overview', { params });
    return response.data;
  }

  async validateReferralCode(code) {
    const response = await this.api.get(`/employees/referral/validate/${code}`);
    return response.data;
  }

  // Statistics
  async getStatistics() {
    try {
      const response = await this.api.get('/statistics');
      return response.data;
    } catch (error) {
      console.warn('Statistics endpoint error, returning basic stats');
      // Fallback: combine data from multiple endpoints
      const [properties, brokers] = await Promise.all([
        this.getProperties({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        this.getBrokers({ limit: 1 }).catch(() => ({ pagination: { total: 0 } }))
      ]);
      
      return {
        totalProperties: properties.pagination?.total || 0,
        totalBrokers: brokers.pagination?.total || 0,
        totalUsers: (properties.pagination?.total || 0) + (brokers.pagination?.total || 0)
      };
    }
  }

  async getDashboardStats() {
    // This endpoint doesn't exist, use getStatistics
    return await this.getStatistics();
  }

  // Analytics (Mock implementations since backend doesn't have these)
  async getUserGrowthData(period = '30d') {
    console.warn('getUserGrowthData not available in backend, returning mock data');
    return this.generateMockGrowthData(period, 'users');
  }

  async getPropertyTrendsData(period = '30d') {
    console.warn('getPropertyTrendsData not available in backend, returning mock data');
    return this.generateMockGrowthData(period, 'properties');
  }

  async getLocationAnalytics() {
    console.warn('getLocationAnalytics not available in backend, returning mock data');
    return [
      { name: 'Mumbai', users: 150, properties: 45, avgPrice: 2500000 },
      { name: 'Delhi', users: 120, properties: 38, avgPrice: 1800000 },
      { name: 'Bangalore', users: 98, properties: 32, avgPrice: 1200000 },
      { name: 'Chennai', users: 75, properties: 28, avgPrice: 900000 },
      { name: 'Hyderabad', users: 62, properties: 22, avgPrice: 800000 }
    ];
  }

  // Export functionality (Mock implementation - backend doesn't have export routes)
  async exportUsers(format = 'csv') {
    console.warn('Export users not available in backend, generating client-side CSV');
    const users = await this.getUsers({ limit: 1000 });
    return this.generateCSV(users.users, 'users');
  }

  async exportProperties(format = 'csv') {
    console.warn('Export properties not available in backend, generating client-side CSV');
    const properties = await this.getProperties({ limit: 1000 });
    return this.generateCSV(properties.properties, 'properties');
  }

  // Helper methods
  generateMockGrowthData(period, type) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        [type]: Math.floor(Math.random() * 20) + 5,
        active: Math.floor(Math.random() * 15) + 3
      });
    }
    
    return data;
  }

  generateCSV(data, type) {
    if (!data || data.length === 0) {
      return new Blob(['No data available'], { type: 'text/csv' });
    }

    const headers = Object.keys(data[0]).filter(key => 
      !key.startsWith('_') && typeof data[0][key] !== 'object'
    );
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `\"${value}\"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }
}

export const apiService = new ApiService();
export default apiService;