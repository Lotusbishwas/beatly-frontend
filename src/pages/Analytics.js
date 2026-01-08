import React, { useState, useEffect } from 'react';
import {
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Spinner, 
  Flex,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Select,
  Stack
} from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../utils/axiosConfig';
import { ENDPOINTS } from '../utils/apiConfig';
import AuthService from '../services/authService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [videos, setVideos] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVideos: 0,
    limit: 20
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    order: 'desc'
  });

  const toast = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Verify user role before making request
        const user = AuthService.getCurrentUser();
        const token = AuthService.getToken();

        if (!user || !['admin'].includes(user.role)) {
          setError('You are not authorized to view analytics');
          setLoading(false);
          return;
        }

        setLoading(true);

        // Convert filters to query string
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        const response = await axiosInstance.get(
          `${ENDPOINTS.VIDEOS.ANALYTICS}?${queryParams.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setVideos(response.data.videos);
        setOverallStats(response.data.overallStats);
        setPagination(response.data.pagination);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        
        const errorMessage = error.response?.data?.details 
          || error.response?.data?.error 
          || error.message
          || 'Failed to fetch analytics data';
        
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filters]);

  // Prepare data for charts
  const viewsData = {
    labels: videos.map(video => video.title),
    datasets: [{
      label: 'Views per Video',
      data: videos.map(video => video.views || 0),
      backgroundColor: 'rgba(75, 192, 192, 0.6)'
    }]
  };

  const likesData = {
    labels: videos.map(video => video.title),
    datasets: [{
      label: 'Likes per Video',
      data: videos.map(video => video.likes || 0),
      backgroundColor: 'rgba(255, 99, 132, 0.6)'
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Video Performance'
      }
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event) => {
    setFilters(prev => ({ 
      ...prev, 
      limit: parseInt(event.target.value),
      page: 1 // Reset to first page when changing limit
    }));
  };

  const handleSortChange = (event) => {
    const [sortBy, order] = event.target.value.split('|');
    setFilters(prev => ({ 
      ...prev, 
      sortBy, 
      order,
      page: 1 // Reset to first page when changing sort
    }));
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <HStack spacing={0} height="100vh">
        <Sidebar />
        <Box flex={1} p={5}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Analytics Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Box>
      </HStack>
    );
  }

  return (
    <HStack spacing={0} height="100vh">
      <Sidebar />
      <Box flex={1} overflowY="auto" p={5}>
        <Heading mb={6}>Video Analytics Dashboard</Heading>
        
        {/* Filtering and Pagination Controls */}
        <Stack direction="row" mb={6} spacing={4}>
          <Select 
            placeholder="Sort By" 
            width="200px"
            onChange={handleSortChange}
          >
            <option value="createdAt|desc">Most Recent</option>
            <option value="createdAt|asc">Oldest First</option>
            <option value="views|desc">Most Viewed</option>
            <option value="likes|desc">Most Liked</option>
          </Select>

          <Select 
            placeholder="Videos per Page" 
            width="150px"
            onChange={handleLimitChange}
            value={filters.limit}
          >
            <option value={20}>20 Videos</option>
            <option value={50}>50 Videos</option>
            <option value={100}>100 Videos</option>
          </Select>
        </Stack>

        {/* Overall Statistics */}
        <HStack spacing={4} mb={6}>
          <Stat>
            <StatLabel>Total Videos</StatLabel>
            <StatNumber>{overallStats.totalVideos}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Views</StatLabel>
            <StatNumber>{overallStats.totalViews}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Likes</StatLabel>
            <StatNumber>{overallStats.totalLikes}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Comments</StatLabel>
            <StatNumber>{overallStats.totalComments}</StatNumber>
          </Stat>
        </HStack>

        {/* Charts */}
        <HStack spacing={4} mb={6}>
          <Box width="50%">
            <Heading size="md" mb={4}>Views per Video</Heading>
            <Bar data={viewsData} options={chartOptions} />
          </Box>
          <Box width="50%">
            <Heading size="md" mb={4}>Likes per Video</Heading>
            <Bar data={likesData} options={chartOptions} />
          </Box>
        </HStack>

        {/* Detailed Video Table */}
        <TableContainer>
          <Heading size="md" mb={4}>Video Performance Details</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Views</Th>
                <Th>Likes</Th>
                <Th>Comments</Th>
                <Th>Upload Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {videos.map(video => (
                <Tr key={video._id}>
                  <Td>{video.title}</Td>
                  <Td>{video.views || 0}</Td>
                  <Td>{video.likes || 0}</Td>
                  <Td>{video.comments || 0}</Td>
                  <Td>{new Date(video.createdAt).toLocaleDateString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        <Flex justify="center" mt={6}>
          <HStack spacing={2}>
            <Button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              isDisabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <Text>
              Page {pagination.currentPage} of {pagination.totalPages}
            </Text>
            <Button 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              isDisabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      </Box>
    </HStack>
  );
};

export default Analytics;
