import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Image, 
  Flex, 
  Icon, 
  Button,
  useToast,
  Avatar,
  HStack,
  FormControl,
  Textarea
} from '@chakra-ui/react';
import { 
  FaEye, 
  FaComment, 
  FaThumbsUp,
  FaPaperPlane
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import AuthService from '../services/authService';
import ConsumerLayout from '../layouts/ConsumerLayout';
import {ENDPOINTS} from '../utils/apiConfig';

const ConsumerVideoDetails = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { videoId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const token = AuthService.getToken();
        const response = await axiosInstance.get(ENDPOINTS.VIDEOS.DETAILS(videoId), {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        setVideo(response.data);
        
        // Check if video is already liked by current user
        const currentUser = AuthService.getCurrentUser();
        setIsLiked(
          Array.isArray(response.data.likes) 
            ? response.data.likes.some(like => like === currentUser?._id) 
            : false
        );
        setLoading(false);
      } catch (error) {
        console.error('Error fetching video details:', error);
        setError(error.message || 'Could not fetch video details');
        toast({
          title: "Error",
          description: error.message || "Could not fetch video details",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  const handleLikeVideo = async () => {
    try {
      const token = AuthService.getToken();
      const response = await axiosInstance.post(
        ENDPOINTS.VIDEOS.LIKE(videoId), 
        {},
        {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        }
      );

      // Update video state with new like information
      setVideo(prevVideo => ({
        ...prevVideo,
        likes: response.data.likes,
        totalLikes: response.data.totalLikes
      }));
      
      // Toggle liked state
      setIsLiked(!isLiked);

      // Show success toast
      toast({
        title: isLiked ? "Unliked" : "Liked",
        description: isLiked ? "Video unliked" : "Video liked",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error liking video:', error);
      toast({
        title: "Error",
        description: "Could not like/unlike video",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        status: "error",
        duration: 2000,
        isClosable: true
      });
      return;
    }

    try {
      const token = AuthService.getToken();
      const response = await axiosInstance.post(ENDPOINTS.COMMENTS.ADD, 
      { 
          text: newComment,
          videoId: videoId 
        },
        {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
    });

      // Refresh video details to get updated comments
      const updatedVideoResponse = await axiosInstance.get(ENDPOINTS.VIDEOS.DETAILS(videoId), {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      // Update video state with new comments
      setVideo(updatedVideoResponse.data);
      
      // Clear comment input
      setNewComment('');

      // Show success toast
      toast({
        title: "Comment Added",
        description: "Your comment has been posted",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Could not post comment",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  if (loading) {
    return (
      <ConsumerLayout>
        <Flex 
          height="100vh" 
          justifyContent="center" 
          alignItems="center"
        >
          <Text>Loading video details...</Text>
        </Flex>
      </ConsumerLayout>
    );
  }

  if (error) {
    return (
      <ConsumerLayout>
        <Flex 
          height="100vh" 
          justifyContent="center" 
          alignItems="center"
          flexDirection="column"
        >
          <Text color="red.500">Error: {error}</Text>
          <Button 
            mt={4} 
            colorScheme="yellow" 
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Flex>
      </ConsumerLayout>
    );
  }

  console.log('video ', video)
  if (!video) {
    return (
      <ConsumerLayout>
        <Flex 
          height="100vh" 
          justifyContent="center" 
          alignItems="center"
        >
          <Text>Video not found</Text>
        </Flex>
      </ConsumerLayout>
    );
  }

  return (
    <ConsumerLayout>
      <Box p={6} bg="white" minHeight="100vh">
        <Flex 
          direction={{ base: 'column', md: 'row' }}
          maxW="container.xl" 
          mx="auto"
        >
          {/* Video Player */}
          <Box 
            flex={1} 
            mr={{ md: 6 }}
            mb={{ base: 6, md: 0 }}
          >
            <video 
              src={video.video.url} 
              controls 
              width="100%" 
              poster={video.video.thumbnail}
              style={{ 
                borderRadius: '10px',
                minHeight: '400px',
                backgroundColor: 'black',
                objectFit: 'contain'
              }}
            />

            {/* Video Title and Stats */}
            <VStack align="start" mt={4} spacing={2}>
              <Heading size="lg">{video.video.title}</Heading>

              {/* Video Stats */}
              <HStack spacing={4} color="gray.600">
                <Flex alignItems="center">
                  <Icon as={FaEye} mr={2} />
                  <Text>{video.video.views || 0} Views</Text>
                </Flex>
                <Flex alignItems="center">
                  <Icon as={FaComment} mr={2} />
                  <Text>{video.comments?.length || 0} Comments</Text>
                </Flex>
                <Flex alignItems="center">
                  <Icon as={FaThumbsUp} mr={2} />
                  <Text>{video.video.likes || 0} Likes</Text>
                </Flex>
              </HStack>
            </VStack>

            {/* Video Actions */}
            <HStack mt={4} spacing={4}>
              <Button 
                leftIcon={<FaThumbsUp />} 
                colorScheme={isLiked ? "yellow" : "gray"} 
                variant="outline"
                onClick={handleLikeVideo}
              >
                {isLiked ? 'Liked' : 'Like'}
              </Button>
            </HStack>
          </Box>

          {/* Comments Section */}
          <Box 
            width={{ base: '100%', md: '400px' }}
            bg="gray.50" 
            p={4} 
            borderRadius="md"
          >
            <Heading size="md" mb={4}>Comments</Heading>
            {video.comments && video.comments.length > 0 ? (
              video.comments.map((comment, index) => (
                <Box 
                  key={index} 
                  bg="white" 
                  p={3} 
                  borderRadius="md" 
                  mb={3}
                >
                  <Text fontWeight="bold">{comment.user?.name || 'Anonymous'}</Text>
                  <Text>{comment.text}</Text>
                </Box>
              ))
            ) : (
              <Text color="gray.500">No comments yet</Text>
            )}
            <FormControl mt={4}>
              <Textarea 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="Add a comment..." 
                rows={4} 
                resize="none"
              />
              <Button 
                mt={2} 
                colorScheme="yellow" 
                leftIcon={<FaPaperPlane />} 
                onClick={handleAddComment}
              >
                Post Comment
              </Button>
            </FormControl>
          </Box>
        </Flex>
      </Box>
    </ConsumerLayout>
  );
};

export default ConsumerVideoDetails;
