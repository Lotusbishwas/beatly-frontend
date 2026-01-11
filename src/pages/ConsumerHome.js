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
  return (
    <Box 
      bg="brand.gray.800"
      borderRadius="2xl" 
      overflow="hidden" 
      border="1px solid"
      borderColor="brand.gray.700"
      transition="all 0.3s ease"
      _hover={{ 
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        borderColor: 'brand.primary',
        cursor: 'pointer',
        _before: {
          opacity: 1
        }
      }}
      onClick={onClick}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '2xl',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        zIndex: -1
      }}
    >
      {/* Video Thumbnail */}
      <Box position="relative">
        <Image 
          src={video.thumbnail}
          alt={video.title}
          objectFit="cover"
          width="full"
          height="220px"
          fallbackSrc="https://via.placeholder.com/300x220"
          onError={(e) => {
            console.error('Thumbnail load error:', e);
            e.target.src = 'https://via.placeholder.com/300x220';
          }}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-t, blackAlpha.800, transparent)"
          opacity={0}
          transition="opacity 0.3s ease"
          _hover={{ opacity: 1 }}
        />
      </Box>

      {/* Video Details */}
      <Box p={6}>
        <Heading size="md" mb={4} noOfLines={2} color="white" fontWeight="bold">
          {video.title}
        </Heading>

        {/* Video Statistics */}
        <HStack spacing={6} justifyContent="space-between">
          <VStack spacing={1} align="start">
            <HStack>
              <Icon as={FaEye} color="brand.accent" size="14px" />
              <Text fontSize="xs" color="gray.400">Views</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" color="white">{video.views || 0}</Text>
          </VStack>

          <VStack spacing={1} align="start">
            <HStack>
              <Icon as={FaComment} color="brand.secondary" size="14px" />
              <Text fontSize="xs" color="gray.400">Comments</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" color="white">{video.comments?.length || 0}</Text>
          </VStack>

          <VStack spacing={1} align="start">
            <HStack>
              <Icon as={FaHeart} color="brand.error" size="14px" />
              <Text fontSize="xs" color="gray.400">Likes</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" color="white">{video.likes || 0}</Text>
          </VStack>
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
      <Box 
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
            Discover Videos
          </Heading>
          <Text color="gray.400" fontSize="lg">
            Explore trending content on Beatly
          </Text>
        </Box>
        
        {/* Filtering and Pagination Controls */}
        <HStack spacing={4} mb={8}>
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
        </HStack>

        {/* Video Grid */}
        <Grid templateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={8}>
          {videos.map(video => (
            <VideoCard
              key={video._id}
              video={video}
              onClick={() => handleVideoClick(video._id)}
            />
          ))}
        </Grid>

        {/* Pagination Controls */}
        <Flex justify="center" mt={10}>
          <HStack spacing={4}>
            <Button 
              onClick={() => handlePageChange(1)}
              isDisabled={pagination.currentPage == 1}
              variant="outline"
              borderColor="brand.primary"
              color="brand.primary"
              _hover={{ bg: 'brand.primary', color: 'white' }}
              _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
            >
              First
            </Button>
            <Button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              isDisabled={pagination.currentPage == 1}
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
              isDisabled={pagination.currentPage == pagination.totalPages}
              variant="outline"
              borderColor="brand.primary"
              color="brand.primary"
              _hover={{ bg: 'brand.primary', color: 'white' }}
              _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
            >
              Next
            </Button>
            <Button 
              onClick={() => handlePageChange(pagination.totalPages)}
              isDisabled={pagination.currentPage == pagination.totalPages}
              variant="outline"
              borderColor="brand.primary"
              color="brand.primary"
              _hover={{ bg: 'brand.primary', color: 'white' }}
              _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
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
