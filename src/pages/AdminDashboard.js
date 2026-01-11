import React, { useState, useEffect } from 'react';
import {
  Box, 
  Flex, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Spinner, 
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton, 
  ModalBody,
  useDisclosure,
  Image,
  useToast,
  GridItem,
  Grid,
  Select,
  FormControl, 
  FormLabel, 
  Input, 
  Textarea,
  FormErrorMessage,
  Tag,
  TagLabel,
  TagCloseButton,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { 
  FaVideo, 
  FaUpload, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaTrash 
} from 'react-icons/fa';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../utils/axiosConfig';
import { ENDPOINTS } from '../utils/apiConfig';
import AuthService from '../services/authService';

const AdminDashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVideos: 0,
    limit: 20
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    order: 'desc'
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isVideoStatsOpen, 
    onOpen: onVideoStatsOpen, 
    onClose: onVideoStatsClose 
  } = useDisclosure();
  const toast = useToast();

  // Delete Video State
  const [videoToDelete, setVideoToDelete] = useState(null);
  const {
    isOpen: isDeleteDialogOpen, 
    onOpen: onDeleteDialogOpen, 
    onClose: onDeleteDialogClose 
  } = useDisclosure();
  const cancelRef = React.useRef();

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      await axiosInstance.delete(ENDPOINTS.VIDEOS.DELETE(videoToDelete));
      
      toast({
        title: "Video Deleted",
        description: "The video has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh video list after deletion
      fetchVideos();
      
      // Close delete confirmation dialog
      onDeleteDialogClose();
      setVideoToDelete(null);
    } catch (error) {
      console.error('Delete video error:', error);
      toast({
        title: "Delete Failed",
        description: error.response?.data?.error || "Failed to delete video",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Check user authorization
  const user = AuthService.getCurrentUser();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Convert filters to query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axiosInstance.get(
        `${ENDPOINTS.VIDEOS.LIST}?${queryParams.toString()}`
      );
      
      // Ensure the response matches the expected structure
      const videoData = response.data || {};
      
      setVideos(videoData.videos || []);
      
      // Set pagination with default values if not provided
      setPagination({
        currentPage: videoData.pagination?.currentPage || 1,
        totalPages: videoData.pagination?.totalPages || 1,
        totalVideos: videoData.pagination?.totalVideos || 0,
        limit: videoData.pagination?.limit || filters.limit
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Failed to load videos';
      
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

  const handleVideoSelect = async (videoId) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.VIDEOS.STATS(videoId));
      setSelectedVideo(response.data);
      onVideoStatsOpen();
    } catch (error) {
      console.error('Error fetching video stats:', error);
      
      const errorMessage = error.response?.data?.details 
        || error.response?.data?.error 
        || 'Failed to fetch video statistics';
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [filters]);

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
      <Flex justify="center" align="center" height="100vh">
        <VStack>
          <Text color="red.500" fontSize="xl">Error: {error}</Text>
          <Button onClick={fetchVideos}>Retry</Button>
        </VStack>
      </Flex>
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
            Video Management
          </Heading>
          <Text color="gray.400" fontSize="lg">
            Manage and monitor your platform content
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
            <GridItem 
              key={video._id} 
              onClick={() => handleVideoSelect(video._id)} 
              cursor="pointer"
            >
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
                  _before: {
                    opacity: 1
                  }
                }}
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
                <Box position="relative">
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title}
                    objectFit="cover"
                    width="100%"
                    height="220px"
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
                <Box p={6}>
                  <Text fontWeight="bold" mb={3} fontSize="lg" color="white" noOfLines={2}>
                    {video.title}
                  </Text>
                  <Text color="gray.400" fontSize="sm" mb={4}>
                    Uploaded on {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Unknown Date'}
                  </Text>
                  <Button 
                    leftIcon={<FaTrash />}
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    borderRadius="lg"
                    _hover={{ 
                      bg: 'red.500',
                      color: 'white',
                      transform: 'translateY(-1px)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoToDelete(video._id);
                      onDeleteDialogOpen();
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </GridItem>
          ))}
        </Grid>

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

        {/* Video Stats Modal */}
        <Modal isOpen={isVideoStatsOpen} onClose={onVideoStatsClose} size="xl" isCentered>
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
          <ModalContent bg="brand.gray.800" borderColor="brand.gray.700" border="1px solid">
            <ModalHeader 
              bgGradient="linear(to-r, brand.primary, brand.secondary)"
              bgClip="text"
              color="white"
              borderBottom="1px solid"
              borderColor="brand.gray.700"
            >
              Video Statistics
            </ModalHeader>
            <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
            <ModalBody>
              {selectedVideo && (
                <VStack spacing={4} align="stretch">
                  {/* Video Details */}
                  <Box>
                    <Text fontSize="xl" fontWeight="bold" mb={2}>Video Details</Text>
                    <HStack spacing={4}>
                      <Image 
                        src={selectedVideo.video.thumbnail} 
                        boxSize="200px" 
                        objectFit="cover" 
                        borderRadius="md"
                      />
                      <VStack align="start" spacing={2}>
                        <Text><strong>Title:</strong> {selectedVideo.video.title}</Text>
                        <Text><strong>Description:</strong> {selectedVideo.video.description}</Text>
                        <Text><strong>Uploaded By:</strong> {selectedVideo.video.uploaderName}</Text>
                        <Text><strong>Upload Date:</strong> {new Date(selectedVideo.video.createdAt).toLocaleDateString()}</Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Performance Statistics */}
                  <Box>
                    <Text fontSize="xl" fontWeight="bold" mb={2}>Performance</Text>
                    <HStack spacing={4}>
                      <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={1}>Views</Text>
                        <Text fontSize="xl">{selectedVideo.video.views}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={1}>Likes</Text>
                        <Text fontSize="xl">{selectedVideo.video.likes}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={1}>Comments</Text>
                        <Text fontSize="xl">{selectedVideo.comments.length}</Text>
                      </Box>
                    </HStack>
                  </Box>

                  {/* Recent Comments */}
                  <Box>
                    <Text fontSize="xl" fontWeight="bold" mb={2}>Recent Comments</Text>
                    {selectedVideo.comments.length > 0 ? (
                      <VStack align="stretch" spacing={2}>
                        {selectedVideo.comments.map(comment => (
                          <Box 
                            key={comment._id} 
                            borderWidth="1px" 
                            borderRadius="md" 
                            p={3}
                          >
                            <HStack justify="space-between">
                              <Text fontWeight="bold">{comment.userName}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </Text>
                            </HStack>
                            <Text mt={2}>{comment.text}</Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text>No comments yet</Text>
                    )}
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onVideoStatsClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Video Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteDialogClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Video
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete this video? This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteVideo} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </HStack>
  );
};

export default AdminDashboard;
