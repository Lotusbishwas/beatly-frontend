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
      <Box flex={1} overflowY="auto" p={5}>
        <Heading mb={6}>Video Management</Heading>
        
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
              onClick={() => handleVideoSelect(video._id)} 
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
                  <Button 
                    leftIcon={<FaTrash />}
                    colorScheme="red"
                    variant="solid"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering video stats modal
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

        {/* Video Stats Modal */}
        <Modal isOpen={isVideoStatsOpen} onClose={onVideoStatsClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Video Statistics</ModalHeader>
            <ModalCloseButton />
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
