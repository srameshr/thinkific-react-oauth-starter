import { useState, useEffect } from "react";
import {
	Box,
	FormControl,
  FormLabel,
  FormErrorMessage,
	FormHelperText,
  Button,
	Input,
	InputLeftAddon,
	InputGroup,
	Divider,
	Text,
	Image,
	VStack,
	Heading
} from "@chakra-ui/react"
import FlagImage from "../../assets/thinkific/images/flag.svg";
import crypto from "crypto";

export default function Authorize() {
	const [thinkficSiteURL, setThinkificSiteURL] = useState('');
	const [codeVerifier, setCodeVerifier] = useState('');
	const [isThinkificSiteURLInvalid, setIsThinkificSiteURLInvalid] = useState(false);

	useEffect(() => {
		window.localStorage.setItem('codeVerifier', generateCodeVerifier());
		setCodeVerifier(window.localStorage.getItem('codeVerifier'));
	}, []);
	
	// transform string to base64 url safe
	const base64EncodeUrlSafe = (string) => {
		return string.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=/g, '');
	}

	// generate random codeVerifier
	// recommended a string with between 43 and 128 characters in size
	const generateCodeVerifier = () => {
		return base64EncodeUrlSafe(crypto.randomBytes(32));
	}

	// generate codeChallenge
	// Base64UrlSafe(SHA256(codeVerifier))
	const codeChallenge = (codeVerifier) => {
		return base64EncodeUrlSafe(sha256(codeVerifier));
	}

	// create codeChallenge hash using sha256
	const sha256 = (codeVerifier) => {
		return crypto.createHash('sha256').update(codeVerifier).digest();
  };

	const onAuthorize = () => {
		if (!thinkficSiteURL) {
			setIsThinkificSiteURLInvalid(true);
			return false;
		}
		const callbackUrl = `${process.env.REACT_APP_THINKIFIC_CALLBACK_URL_HOST}/thinkific/callback`;
		window.location.href = (`http://${thinkficSiteURL}/oauth2/authorize?client_id=${
			process.env.REACT_APP_THINKIFIC_CLIENT_ID
		}&response_type=code&redirect_uri=${
			callbackUrl
		}&code_challenge=${
			codeChallenge(codeVerifier)
		}&code_challenge_method=S256`)
	}

	const onThinkficSiteURLChange = (e) => {
		setIsThinkificSiteURLInvalid(false);
		setThinkificSiteURL(e.target.value)
	} 

	return (
		<Box marginTop="24">
			<VStack>
				<Box boxSize="sm">
					<VStack spacing="3">
						<Image boxSize="200px" src={FlagImage}/>
						<Heading as="h1" size="md">Thinkifc Store Authentication</Heading>
						<Text>The access data to your Thinkific site has expired.</Text>
					</VStack>
					<br />
					<Divider />
					<br />
					<VStack spacing="3">
						<FormControl id="thinkific-site" isRequired isInvalid={isThinkificSiteURLInvalid}>
							<FormLabel>Thinkfic site domain</FormLabel>
							<InputGroup>
								<InputLeftAddon children="https://" />
								<Input onChange={onThinkficSiteURLChange} type="text" value={thinkficSiteURL} placeholder="mysite.thinkific.com or custom domain" />
							</InputGroup>
							<FormErrorMessage>This is required</FormErrorMessage>
						</FormControl>
						<Button onClick={onAuthorize} isFullWidth>Authorize</Button>
					</VStack>
				</Box>
			</VStack>
		</Box>
	);
  }