import React, { useState, useEffect } from 'react';
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
  Spinner,
  Flex
} from '@chakra-ui/react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const checkExistingLogin = () => {
      const user = AuthService.getCurrentUser();
      
      if (user) {
        switch(user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'consumer':
            navigate('/consumer/home');
            break;
          default:
            toast({
              title: "Login Error",
              description: "Unknown user role",
              status: "error",
              duration: 3000,
              isClosable: true
            });
        }
      }
      setIsLoading(false);
    };

    checkExistingLogin();
  }, [navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await AuthService.login(email, password);
      
      console.log('Logged in user:', user);
      
      // Redirect based on user role
      switch(user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'consumer':
          navigate('/consumer/videos');
          break;
        default:
          toast({
            title: "Login Error",
            description: "Unknown user role",
            status: "error",
            duration: 3000,
            isClosable: true
          });
          navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      setError(err.response?.data?.message || 'Login failed');
      toast({
        title: "Login Error",
        description: error,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      height="100vh"
      bgGradient="linear(135deg, brand.dark 0%, brand.darker 100%)"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: 'radial(circle at 20% 50%, brand.primary 0%, transparent 50%), radial(circle at 80% 20%, brand.secondary 0%, transparent 50%)',
        opacity: 0.1
      }}
    >
      <Box 
        width="450px" 
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
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)',
          zIndex: -1
        }}
      >
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Box textAlign="center" mb={2}>
            <Text 
              fontSize="3xl" 
              fontWeight="bold" 
              bgGradient="linear(to-r, brand.primary, brand.secondary)"
              bgClip="text"
              mb={2}
            >
              Welcome Back
            </Text>
            <Text fontSize="sm" color="gray.400">
              Sign in to your Beatly account
            </Text>
          </Box>

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
              placeholder="Enter your password"
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
            Sign In
          </Button>

          <Text color="gray.400" fontSize="sm">
            New Consumer? <Button 
              variant="link" 
              color="brand.primary"
              fontWeight="semibold"
              _hover={{ color: 'brand.secondary' }}
              onClick={() => navigate('/signup')}
            >
              Create Account
            </Button>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

export default Login;
