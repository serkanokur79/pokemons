import '@testing-library/jest-dom'; // Import jest-dom for additional matchers
import { TextEncoder, TextDecoder } from 'util';
import dotenv from 'dotenv';

// Load environment variables from .env.test file
dotenv.config({ path: '.env.test' });
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;