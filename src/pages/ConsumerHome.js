import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Image, 
  Flex, 
  Icon, 
  Grid, 
  GridItem,
  Button,
  useToast,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Avatar,
  Select,
  Spinner
} from '@chakra-ui/react';
import { 
  FaEye, 
  FaComment, 
  FaVideo,
  FaHeart 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import AuthService from '../services/authService';
import ConsumerLayout from '../layouts/ConsumerLayout';
import {ENDPOINTS} from '../utils/apiConfig';

const VideoCard = ({ video, onClick }) => {
  console.log('Video:', video);

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      boxShadow="md"
      transition="transform 0.2s"
      _hover={{ 
        transform: 'scale(1.02)',
        boxShadow: 'lg',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {/* Video Thumbnail */}
      <Box position="relative">
        <Image 
          src={video.thumbnail}
          alt={video.title}
          objectFit="cover"
          width="full"
          height="200px"
          fallbackSrc="https://via.placeholder.com/300x200"
          onError={(e) => {
            console.error('Thumbnail load error:', e);
            e.target.src = 'https://via.placeholder.com/300x200';
          }}
        />
      </Box>

      {/* Video Details */}
      <Box p={4}>
        <Heading size="md" mb={4} noOfLines={1}>
          {video.title}
        </Heading>

        {/* Video Statistics */}
        <HStack spacing={4} justifyContent="space-between">
          <Stat>
            <StatLabel>
              <Icon as={FaEye} mr={2} color="gray.500" />
              Views
            </StatLabel>
            <StatNumber>{video.views || 0}</StatNumber>
          </Stat>

          <Stat>
            <StatLabel>
              <Icon as={FaComment} mr={2} color="blue.500" />
              Comments
            </StatLabel>
            <StatNumber>{video.comments?.length || 0}</StatNumber>
          </Stat>

          <Stat>
            <StatLabel>
              <Icon as={FaHeart} mr={2} color="red.500" />
              Likes
            </StatLabel>
            <StatNumber>{video.likes || 0}</StatNumber>
          </Stat>
        </HStack>
      </Box>
    </Box>
  );
};

const ConsumerHome = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Pagination and Filtering State
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVideos: 0
  });

  const [filters, setFilters] = useState({
    sortBy: 'createdAt',
    order: 'desc',
    limit: 20
  });

  // Fetch Videos
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(ENDPOINTS.VIDEOS.LIST, {
        params: {
          page: pagination.currentPage,
          limit: filters.limit,
          sortBy: filters.sortBy,
          order: filters.order
        }
      });

      setVideos(response.data.videos);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalVideos: response.data.totalVideos
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.response?.data?.message || 'Failed to fetch videos');
      setLoading(false);
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Pagination Handlers
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ 
      ...prev, 
      currentPage: Math.max(1, Math.min(newPage, prev.totalPages)) 
    }));
  };

  // Sorting and Limit Handlers
  const handleSortChange = (e) => {
    const [sortBy, order] = e.target.value.split('|');
    setFilters(prev => ({ 
      ...prev, 
      sortBy, 
      order,
      page: 1 // Reset to first page when changing sort
    }));
  };

  const handleLimitChange = (e) => {
    setFilters(prev => ({ 
      ...prev, 
      limit: parseInt(e.target.value),
      page: 1 // Reset to first page when changing limit
    }));
  };

  // Fetch videos on component mount and when filters change
  useEffect(() => {
    fetchVideos();
  }, [pagination.currentPage, filters]);

  // Video Click Handler
  const handleVideoClick = (videoId) => {
    navigate(`/consumer/video/${videoId}`);
  };

  if (loading) {
    return (
      <ConsumerLayout>
        <Flex justify="center" align="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      </ConsumerLayout>
    );
  }

  if (error) {
    return (
      <ConsumerLayout>
        <Flex justify="center" align="center" height="100vh">
          <VStack>
            <Text color="red.500" fontSize="xl">Error: {error}</Text>
            <Button onClick={fetchVideos}>Retry</Button>
          </VStack>
        </Flex>
      </ConsumerLayout>
    );
  }

  return (
    <ConsumerLayout>
      <Box p={5}>
        <Heading mb={6}>Discover Videos</Heading>
        
        {/* Filtering and Pagination Controls */}
        <HStack spacing={4} mb={6}>
          <Select 
            placeholder="Sort By" 
            width="200px"
            onChange={handleSortChange}
          >
            <option value="createdAt|desc">Most Recent</option>
            <option value="createdAt|asc">Oldest First</option>
            <option value="views|desc">Most Viewed</option>
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
        </HStack>

        {/* Video Grid */}
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {videos.map(video => (
            <GridItem 
              key={video._id} 
              onClick={() => handleVideoClick(video._id)} 
              cursor="pointer"
            >
              <Box 
                borderWidth="1px" 
                borderRadius="lg" 
                overflow="hidden"
                transition="transform 0.2s"
                _hover={{ transform: 'scale(1.05)' }}
              >
                <Image 
                  src={video.thumbnail} 
                  alt={video.title}
                  objectFit="cover"
                  width="100%"
                  height="200px"
                />
                <Box p={4}>
                  <Text fontWeight="bold" mb={2}>{video.title}</Text>
                  <Text color="gray.500" fontSize="sm">
                    Uploaded on {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Unknown Date'}
                  </Text>
                </Box>
              </Box>
            </GridItem>
          ))}
        </Grid>

        {/* Pagination Controls */}
        <Flex justify="center" mt={6}>
          <HStack spacing={2}>
            <Button 
              onClick={() => handlePageChange(1)}
              isDisabled={pagination.currentPage == 1}
            >
              First
            </Button>
            <Button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              isDisabled={pagination.currentPage == 1}
            >
              Previous
            </Button>
            <Text>
              Page {pagination.currentPage} of {pagination.totalPages}
            </Text>
            <Button 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              isDisabled={pagination.currentPage == pagination.totalPages}
            >
              Next
            </Button>
            <Button 
              onClick={() => handlePageChange(pagination.totalPages)}
              isDisabled={pagination.currentPage == pagination.totalPages}
            >
              Last
            </Button>
          </HStack>
        </Flex>
      </Box>
    </ConsumerLayout>
  );
};

export default ConsumerHome;
