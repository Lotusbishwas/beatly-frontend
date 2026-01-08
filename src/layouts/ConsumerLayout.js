import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';

const ConsumerLayout = ({ children }) => {
  return (
    <Flex>
      <Sidebar />
      <Box 
        flex={1} 
        width="100%"
        ml={0}  
      >
        {children}
      </Box>
    </Flex>
  );
};

export default ConsumerLayout;
