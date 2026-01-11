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
      <Box 
        flex={1} 
        overflowY="auto" 
        p={8}
        bg="brand.dark"
        minHeight="100vh"
      >
        <Box mb={8}>
          <Heading 
            size="xl" 
            bgGradient="linear(to-r, brand.primary, brand.secondary)"
            bgClip="text"
            fontWeight="bold"
            mb={2}
          >
            Analytics Dashboard
          </Heading>
          <Text color="gray.400" fontSize="lg">
            Track performance and insights for your content
          </Text>
        </Box>
        
        {/* Filtering and Pagination Controls */}
        <Stack direction="row" mb={8} spacing={4}>
          <Select 
            placeholder="Sort By" 
            width="220px"
            onChange={handleSortChange}
            bg="brand.gray.800"
            borderColor="brand.gray.700"
            color="white"
            _hover={{ borderColor: 'brand.primary' }}
            _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.4)' }}
          >
            <option value="createdAt|desc" style={{ background: '#1E293B', color: 'white' }}>Most Recent</option>
            <option value="createdAt|asc" style={{ background: '#1E293B', color: 'white' }}>Oldest First</option>
            <option value="views|desc" style={{ background: '#1E293B', color: 'white' }}>Most Viewed</option>
            <option value="likes|desc" style={{ background: '#1E293B', color: 'white' }}>Most Liked</option>
          </Select>

          <Select 
            placeholder="Videos per Page" 
            width="180px"
            onChange={handleLimitChange}
            value={filters.limit}
            bg="brand.gray.800"
            borderColor="brand.gray.700"
            color="white"
            _hover={{ borderColor: 'brand.primary' }}
            _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.4)' }}
          >
            <option value={20} style={{ background: '#1E293B', color: 'white' }}>20 Videos</option>
            <option value={50} style={{ background: '#1E293B', color: 'white' }}>50 Videos</option>
            <option value={100} style={{ background: '#1E293B', color: 'white' }}>100 Videos</option>
          </Select>
        </Stack>

        {/* Overall Statistics */}
        <HStack spacing={6} mb={10}>
          <Box
            bg="brand.gray.800"
            p={6}
            borderRadius="2xl"
            border="1px solid"
            borderColor="brand.gray.700"
            flex={1}
            _hover={{ borderColor: 'brand.accent', transform: 'translateY(-2px)' }}
            transition="all 0.3s ease"
          >
            <Stat>
              <StatLabel color="gray.400" fontSize="sm">Total Videos</StatLabel>
              <StatNumber color="brand.accent" fontSize="3xl" fontWeight="bold">{overallStats.totalVideos}</StatNumber>
            </Stat>
          </Box>
          <Box
            bg="brand.gray.800"
            p={6}
            borderRadius="2xl"
            border="1px solid"
            borderColor="brand.gray.700"
            flex={1}
            _hover={{ borderColor: 'brand.primary', transform: 'translateY(-2px)' }}
            transition="all 0.3s ease"
          >
            <Stat>
              <StatLabel color="gray.400" fontSize="sm">Total Views</StatLabel>
              <StatNumber color="brand.primary" fontSize="3xl" fontWeight="bold">{overallStats.totalViews}</StatNumber>
            </Stat>
          </Box>
          <Box
            bg="brand.gray.800"
            p={6}
            borderRadius="2xl"
            border="1px solid"
            borderColor="brand.gray.700"
            flex={1}
            _hover={{ borderColor: 'brand.error', transform: 'translateY(-2px)' }}
            transition="all 0.3s ease"
          >
            <Stat>
              <StatLabel color="gray.400" fontSize="sm">Total Likes</StatLabel>
              <StatNumber color="brand.error" fontSize="3xl" fontWeight="bold">{overallStats.totalLikes}</StatNumber>
            </Stat>
          </Box>
          <Box
            bg="brand.gray.800"
            p={6}
            borderRadius="2xl"
            border="1px solid"
            borderColor="brand.gray.700"
            flex={1}
            _hover={{ borderColor: 'brand.secondary', transform: 'translateY(-2px)' }}
            transition="all 0.3s ease"
          >
            <Stat>
              <StatLabel color="gray.400" fontSize="sm">Total Comments</StatLabel>
              <StatNumber color="brand.secondary" fontSize="3xl" fontWeight="bold">{overallStats.totalComments}</StatNumber>
            </Stat>
          </Box>
        </HStack>

        {/* Charts */}
        <HStack spacing={8} mb={10}>
          <Box 
            width="50%" 
            bg="brand.gray.800"
            p={6}
            borderRadius="2xl"
            border="1px solid"
            borderColor="brand.gray.700"
          >
            <Heading size="md" mb={6} color="white">Views per Video</Heading>
            <Bar data={viewsData} options={chartOptions} />
          </Box>
          <Box 
            width="50%"
            bg="brand.gray.800"
            p={6}
            borderRadius="2xl"
            border="1px solid"
            borderColor="brand.gray.700"
          >
            <Heading size="md" mb={6} color="white">Likes per Video</Heading>
            <Bar data={likesData} options={chartOptions} />
          </Box>
        </HStack>

        {/* Detailed Video Table */}
        <Box
          bg="brand.gray.800"
          borderRadius="2xl"
          border="1px solid"
          borderColor="brand.gray.700"
          overflow="hidden"
        >
          <Box p={6} borderBottom="1px solid" borderColor="brand.gray.700">
            <Heading size="md" color="white">Video Performance Details</Heading>
          </Box>
          <TableContainer>
            <Table variant="simple">
              <Thead bg="brand.gray.900">
                <Tr>
                  <Th color="gray.300" borderColor="brand.gray.700">Title</Th>
                  <Th color="gray.300" borderColor="brand.gray.700">Views</Th>
                  <Th color="gray.300" borderColor="brand.gray.700">Likes</Th>
                  <Th color="gray.300" borderColor="brand.gray.700">Comments</Th>
                  <Th color="gray.300" borderColor="brand.gray.700">Upload Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {videos.map(video => (
                  <Tr key={video._id} _hover={{ bg: 'brand.gray.700' }}>
                    <Td color="white" borderColor="brand.gray.700">{video.title}</Td>
                    <Td color="brand.primary" fontWeight="semibold" borderColor="brand.gray.700">{video.views || 0}</Td>
                    <Td color="brand.error" fontWeight="semibold" borderColor="brand.gray.700">{video.likes || 0}</Td>
                    <Td color="brand.secondary" fontWeight="semibold" borderColor="brand.gray.700">{video.comments || 0}</Td>
                    <Td color="gray.400" borderColor="brand.gray.700">{new Date(video.createdAt).toLocaleDateString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* Pagination Controls */}
        <Flex justify="center" mt={10}>
          <HStack spacing={4}>
            <Button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              isDisabled={pagination.currentPage === 1}
              variant="outline"
              borderColor="brand.primary"
              color="brand.primary"
              _hover={{ bg: 'brand.primary', color: 'white' }}
              _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
            >
              Previous
            </Button>
            <Text color="gray.300" fontSize="lg" fontWeight="semibold">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Text>
            <Button 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              isDisabled={pagination.currentPage === pagination.totalPages}
              variant="outline"
              borderColor="brand.primary"
              color="brand.primary"
              _hover={{ bg: 'brand.primary', color: 'white' }}
              _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
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
