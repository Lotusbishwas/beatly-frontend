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
      bg="yellow.50"
    >
      <Box 
        width="400px" 
        p={8} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Welcome Back
          </Text>

          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormControl>

          {error && (
            <Text color="red.500" textAlign="center">
              {error}
            </Text>
          )}

          <Button 
            colorScheme="yellow" 
            width="full" 
            type="submit"
          >
            Login
          </Button>

          <Text>
            New Consumer? <Button 
              variant="link" 
              colorScheme="yellow"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

export default Login;
