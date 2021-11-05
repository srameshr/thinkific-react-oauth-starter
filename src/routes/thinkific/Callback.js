import { useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
  Flex,
  Button,
	ButtonGroup,
	Divider,
	VStack,
	Heading
} from "@chakra-ui/react"
import axios from "axios";

const TOKEN_FETCHING = 'TOKEN_FETCHING';
const TOKEN_SUCCESS = 'TOKEN_SUCCESS';
const TOKEN_FAILURE = 'TOKEN_FAILURE';

const accessTokenReducer = (state = {}, action) => {
  switch (action.type) {
    case 'TOKEN_FETCHING':
      return {
				...state,
				loading: true,
			}
		case 'TOKEN_SUCCESS':
			return {
				...state,
				loading: false,
				error: null,
				data: action.data
			}
		case 'TOKEN_FAILURE':
			return {
				...state,
				loading: false,
				data: null,
				error: action.error
			}
    default:
      return state;
  }
}

export default function Callback(props) {
	const navigate = useNavigate();
	const [accessTokenData, dispatch] = useReducer(accessTokenReducer, {});

	useEffect(() => {
		getAccessToken();
	}, []);

	const getAccessToken = async () => {
		const code = new URLSearchParams(window.location.search).get('code');
		const subdomain = new URLSearchParams(window.location.search).get('subdomain');
		const tokenUrl = `https://${subdomain}.thinkific.com/oauth2/token`;

		try {
			dispatch({ type: TOKEN_FETCHING, data: null, error: null });
			const tokenResponse = await axios.post(tokenUrl, {
				grant_type: 'authorization_code',
				code_verifier: window.localStorage.getItem('codeVerifier'),
				code,
			}, {
				auth: {
					username: process.env.REACT_APP_THINKIFIC_CLIENT_ID,
				},
			});
			localStorage.setItem('thinkificAccessToken', tokenResponse.data.access_token);
			// // store token expiration time
			const expiresAt = calculateExpirationTime(tokenResponse.data.expires_in);
			localStorage.setItem('thinkificAccessTokenExpiresAt', expiresAt);
			// // redirect to home
			dispatch({ type: TOKEN_SUCCESS, data: tokenResponse.data, error: null });
			setTimeout(() => navigate('/'), 2000);
		} catch (e) {
			dispatch({ type: TOKEN_FAILURE, data: null, error: e.message });
		}
	}
	
	const calculateExpirationTime = (expiresIn) => {
		const now = new Date().getTime();
		// sum secods to token generated time
		return now + (expiresIn * 1000);
	}
	
	const getStatusHeader = () => {
		if (accessTokenData.loading) {
			return "Loading..."
		} else if (accessTokenData.error) {
			return accessTokenData.error;
		} else if (accessTokenData.data){
			return "Successfully authorized! Redirecting...";
		}
	}

	const renderRetryButton = () => {
		if (accessTokenData.error) {
			return (
				<ButtonGroup>
					<Button onClick={getAccessToken}>Try Again</Button>	
					<Button onClick={() => navigate('/thinkific/authorize')}>Restart Authorization</Button>	
				</ButtonGroup>
			);
		}
	}

	return (
		<Box marginTop="24">
			<Flex direction="column" align="center">
				<VStack spacing="3">
					<Heading as="h1" size="md">{getStatusHeader()}</Heading>
				</VStack>
				<br />
				<Divider />
				<br />
				<VStack spacing="3">
					{renderRetryButton()}
				</VStack>
			</Flex>
		</Box>
	);
  }