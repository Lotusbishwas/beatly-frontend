import React, { useState } from 'react';
import AuthService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Flex
} from '@chakra-ui/react';

function ConsumerSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      await AuthService.register(name, email, password, 'consumer');
      toast({
        title: "Account Created",
        description: "Your account has been created successfully",
        status: "success",
        duration: 3000,
        isClosable: true
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed');
      toast({
        title: "Signup Error",
        description: err.message || 'Signup failed',
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      bgGradient="linear(135deg, brand.dark 0%, brand.darker 100%)"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: 'radial(circle at 30% 40%, brand.secondary 0%, transparent 50%), radial(circle at 70% 80%, brand.primary 0%, transparent 50%)',
        opacity: 0.1
      }}
    >
      <Box 
        width="480px" 
        p={10} 
        borderRadius="3xl" 
        boxShadow="2xl"
        bg="brand.gray.800"
        border="1px solid"
        borderColor="brand.gray.700"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '3xl',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.1) 100%)',
          zIndex: -1
        }}
      >
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Box textAlign="center" mb={2}>
            <Text 
              fontSize="3xl" 
              fontWeight="bold" 
              bgGradient="linear(to-r, brand.secondary, brand.primary)"
              bgClip="text"
              mb={2}
            >
              Join Beatly
            </Text>
            <Text fontSize="sm" color="gray.400">
              Create your account and start exploring
            </Text>
          </Box>

          <FormControl id="name" isRequired>
            <FormLabel color="gray.300" fontWeight="semibold">Full Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              size="lg"
              borderRadius="xl"
            />
          </FormControl>

          <FormControl id="email" isRequired>
            <FormLabel color="gray.300" fontWeight="semibold">Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              size="lg"
              borderRadius="xl"
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel color="gray.300" fontWeight="semibold">Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              minLength="8"
              size="lg"
              borderRadius="xl"
            />
          </FormControl>

          <FormControl id="confirm-password" isRequired>
            <FormLabel color="gray.300" fontWeight="semibold">Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              minLength="8"
              size="lg"
              borderRadius="xl"
            />
          </FormControl>

          {error && (
            <Text color="brand.error" textAlign="center" fontSize="sm">
              {error}
            </Text>
          )}

          <Button 
            variant="gradient"
            width="full" 
            type="submit"
            size="lg"
            fontSize="md"
            fontWeight="bold"
          >
            Create Account
          </Button>

          <Text color="gray.400" fontSize="sm">
            Already have an account? <Button 
              variant="link" 
              color="brand.primary"
              fontWeight="semibold"
              _hover={{ color: 'brand.secondary' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

export default ConsumerSignup;
