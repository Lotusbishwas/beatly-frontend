import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Icon,
  Text,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react';
import {
  FaChartBar,
  FaVideo,
  FaHome,
  FaSignOutAlt,
  FaCloudUploadAlt
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';
import axiosInstance from '../utils/axiosConfig';
import { ENDPOINTS } from '../utils/apiConfig';

const SidebarItem = ({ icon, label, to, onClick, isActive }) => {
  return (
    <Flex
      as={Link}
      to={to}
      onClick={onClick}
      alignItems="center"
      width="full"
      p={4}
      borderRadius="xl"
      position="relative"
      _hover={{
        bg: 'brand.gray.700',
        color: 'white',
        transform: 'translateX(4px)'
      }}
      bg={isActive ? 'brand.primary' : 'transparent'}
      color={isActive ? 'white' : 'gray.300'}
      transition="all 0.3s ease"
      _before={{
        content: '""',
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '4px',
        height: isActive ? '100%' : '0%',
        bg: 'brand.accent',
        borderRadius: 'full',
        transition: 'height 0.3s ease'
      }}
    >
      <Icon as={icon} mr={3} size="20px" />
      <Text fontWeight="semibold" fontSize="sm">{label}</Text>
    </Flex>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Upload Video State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 3 || title.length > 100) {
      newErrors.title = 'Title must be between 3 and 100 characters';
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10 || description.length > 500) {
      newErrors.description = 'Description must be between 10 and 500 characters';
    }

    // Video file validation
    if (!videoFile) {
      newErrors.videoFile = 'Video file is required';
    }

    // Tags validation
    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (tags.length > 10) {
      newErrors.tags = 'Maximum of 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim().toLowerCase();

    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (tags.length >= 10) {
        toast({
          title: 'Tag Limit Exceeded',
          description: 'Maximum of 10 tags allowed',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Form Validation Failed',
        description: 'Please check your input fields',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags.join(','));

    // Ensure video file is added first
    if (videoFile) {
      formData.append('video', videoFile, videoFile.name);
    }

    // Add thumbnail if it exists
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile, thumbnailFile.name);
    }

    try {
      const response = await axiosInstance.post(ENDPOINTS.VIDEOS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Increase timeout for large file uploads
        timeout: 60000 // 1 minute
      });

      toast({
        title: 'Video Uploaded',
        description: 'Your video has been uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      // Close modal
      onClose();

      // Reset form
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnailFile(null);
      setTags([]);
      setCurrentTag('');
      setErrors({});
    } catch (error) {
      console.error('Error uploading video:', error.response?.data || error.message);

      toast({
        title: 'Upload Failed',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Check if user has access to analytics
  const canAccessAnalytics = ['admin', 'manager'].includes(user?.role);

  return (
    <Box
      width="280px"
      height="100vh"
      bg="brand.gray.900"
      p={6}
      borderRight="1px solid"
      borderColor="brand.gray.700"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '1px',
        height: '100%',
        bgGradient: 'linear(to-b, brand.primary, brand.secondary, brand.accent)',
        opacity: 0.3
      }}
    >
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" py={4}>
          <Heading 
            size="lg" 
            bgGradient="linear(to-r, brand.primary, brand.secondary)"
            bgClip="text"
            fontWeight="bold"
            letterSpacing="tight"
          >
            Beatly
          </Heading>
          <Text fontSize="xs" color="gray.400" mt={1} fontWeight="medium">
            Media Platform
          </Text>
        </Box>

        {/* Dashboard Routes */}
        {user?.role === 'consumer' && (
          <>
            <SidebarItem
              icon={FaHome}
              label="Home"
              to="/consumer/home"
            />
          </>
        )}

        {user?.role === 'admin' && (
          <SidebarItem
            icon={FaHome}
            label="Admin Dashboard"
            to="/admin/dashboard"
          />
        )}
        {user?.role === 'admin' && (
          <SidebarItem
            icon={FaCloudUploadAlt}
            label="Upload Video"
            onClick={onOpen}
            to="#"
          />
        )}
        {/* Analytics Route */}
        {canAccessAnalytics && (
          <SidebarItem
            icon={FaChartBar}
            label="Analytics"
            to="/analytics"
          />
        )}

        {/* Logout */}
        <SidebarItem
          icon={FaSignOutAlt}
          label="Logout"
          onClick={handleLogout}
          to="#"
        />
      </VStack>

      {/* Upload Video Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent 
          bg="brand.gray.800" 
          borderRadius="2xl"
          border="1px solid"
          borderColor="brand.gray.700"
          boxShadow="xl"
        >
          <ModalHeader 
            bgGradient="linear(to-r, brand.primary, brand.secondary)"
            bgClip="text"
            color="white"
            fontWeight="bold"
            borderBottom="1px solid"
            borderColor="brand.gray.700"
          >
            Upload Video
          </ModalHeader>
          <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
          <ModalBody p={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.title}>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                  />
                  {errors.title && (
                    <FormErrorMessage>{errors.title}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.description}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter video description"
                  />
                  {errors.description && (
                    <FormErrorMessage>{errors.description}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.tags}>
                  <FormLabel>Tags</FormLabel>
                  <Flex>
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tags (max 10)"
                      mr={2}
                    />
                    <Button onClick={handleAddTag} colorScheme="blue">
                      Add Tag
                    </Button>
                  </Flex>
                  {errors.tags && (
                    <FormErrorMessage>{errors.tags}</FormErrorMessage>
                  )}
                  <Flex wrap="wrap" mt={2}>
                    {tags.map(tag => (
                      <Tag
                        key={tag}
                        m={1}
                        colorScheme="blue"
                      >
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                      </Tag>
                    ))}
                  </Flex>
                </FormControl>

                <FormControl isInvalid={!!errors.videoFile}>
                  <FormLabel>Video File</FormLabel>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    p={1}
                  />
                  {errors.videoFile && (
                    <FormErrorMessage>{errors.videoFile}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Thumbnail (Optional)</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    p={1}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  width="full"
                >
                  Upload Video
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;
