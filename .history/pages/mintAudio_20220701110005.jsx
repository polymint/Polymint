import { useEffect, useState } from "react";
import Head from "next/head";
import {
    Card,
    Input,
    Button,
    Modal,
    Image,
    Select,
    Typography,
    notification,
} from "antd";
import {
    useMoralis,
    useMoralisFile,
    useWeb3ExecuteFunction,
} from "react-moralis";
import NftImageUploader from "../components/NftImageUploader";
import NftAudioUploader from "../components/NftAudioUploader.jsx";
import { CONTRACT_ADDRESS } from "../consts/vars";
import { BLOCK_NEWS_MEDIA_CONTRACT_ABI } from "../consts/contractAbis";
import useWindowDimensions from "../util/useWindowDimensions";
import moralis from "moralis";

const styles = {
    title: {
        fontSize: "20px",
        fontWeight: "700",
    },
    text: {
        fontSize: "16px",
    },
    card: {
        boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
        border: "1px solid #e7eaf3",
        borderRadius: "0.5rem",
        width: "50%",
    },
    mobileCard: {
        boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
        border: "1px solid #e7eaf3",
        borderRadius: "0.5rem",
        width: "100%",
    },
    container: {
        padding: "0 2rem",
    },
    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
    },
    button: {
        float: "right",
        marginTop: "10px",
    },
    text: {
        fontSize: "14px",
        alignSelf: "center",
    },
    textAuthor: {
        fontSize: "14px",
        marginLeft: "10px",
        alignSelf: "center",
    },
    inputContainer: {
        display: "flex",
        flexWrap: "wrap",
    },
    childInputContainer: {
        padding: "10px",
    },
};

moralis.initialize(process.env.NEXT_PUBLIC_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;

const { Option } = Select;
const { Text } = Typography;

export default function MintAudio() {
    
    const {
        Moralis,
        isWeb3Enabled,
        enableWeb3,
        isAuthenticated,
        isWeb3EnableLoading,
    } = useMoralis();
    const user = moralis.User.current();

    const { error, saveFile } = useMoralisFile();

    const [isNftMintInProcess, setIsNftMintInProcess] = useState(false);
    const [isInputValid, setIsInputValid] = useState(false);
    const [uploadedImageFile, setUploadedImageFile] = useState(null);
    const [uploadedAudioFile, setUploadedAudioFile] = useState(null);
    const [uploadedImageUri, setUploadedImageUri] = useState(null);
    const [uploadedAudioUri, setUploadedAudioUri] = useState(null);
    const [titleText, setTitleText] = useState("");
    const [categoryName, setCategoryName] = useState("");

    const { width } = useWindowDimensions();
    const isMobile = width < 700;

    const {
        data,
        error: executeContractError,
        fetch: executeContractFunction,
        isFetching,
        isLoading,
    } = useWeb3ExecuteFunction();

    useEffect(() => {
        if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading)
            enableWeb3();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isWeb3Enabled]);

    useEffect(() => {
        if (!isFetching && !isLoading && data) {
            setIsNftMintInProcess(false);

            Modal.success({
                title: "Congrats! Your NFT has been created!",
                content: (
                    <div>
                        <p>
                            Note: Check the Feed to see your post!
                        </p>
                        <Image
                            width={270}
                            src={uploadedImageUri}
                            preview={true}
                            placeholder={true}
                        />
                        <p>
                            <b>Title:</b> {titleText}
                        </p>
                        <p>
                            <b>Category:</b> {categoryName}
                        </p>
                    </div>
                ),
                onOk() {
                    setTitleText("");
                    setCategoryName("");
                },
            });
        }
    }, [isFetching, isLoading]);

    useEffect(() => {
        if (
            titleText.length !== 0 &&
            uploadedImageFile &&
            uploadedAudioFile &&
            categoryName.length !== 0
        ) {
            setIsInputValid(true);
        }
    }, [ titleText, uploadedImageFile, uploadedAudioFile, categoryName]); 

    useEffect(() => {
        if (executeContractError && executeContractError.code === 4001) {
            setIsNftMintInProcess(false);
            notification.error({
                message: "NFT Mint Error",
                description: executeContractError.message,
            });
        }
    }, [executeContractError]);

    const uploadNftToIpfsAndMintToken = async () => {
        if(!isInputValid) {
            window.alert("Not all fields filled in! Please fill in all fields and then re-submit.")
            setIsNftMintInProcess(false);
            return
        }

        if (isAuthenticated) {
            notification.info({
                message: "Minting in progress",
                description: "Your minting is in progress",
            });

            const nftImage = await saveFile("nft", uploadedImageFile, {
                saveIPFS: true,
            });

            if (error) {
                console.error("Error uploading NFT Image to IPFS");
            }
            
            const nftAudio = await saveFile("nft", uploadedAudioFile, {
                saveIPFS: true,
            });

            if (error) {
                console.error("Error uploading NFT Audio to IPFS");
            }

            const nftMetadataObj = {
                name: titleText,
                image: nftImage._ipfs,
                audio: nftAudio._ipfs,
                attributes: [
                    { category: categoryName },
                ],
            };

            const nftMetadata = await saveFile(
                `${titleText.replace(/\s/g, "")}.json`,
                { base64: btoa(JSON.stringify(nftMetadataObj)) },
                {
                    type: "application/json",
                    saveIPFS: true,
                }
            );

            async function saveAudio() {

                if(!nftAudio._ipfs) return;
        
                const Posts = moralis.Object.extend("Posts");
        
                const newPost = new Posts();
                       
                newPost.set("postImg", nftImage._ipfs);
                newPost.set("postAudio", nftAudio._ipfs);
                newPost.set("postTitle", titleText);
                newPost.set("postCategory", categoryName);
                newPost.set("postPfp", user?.attributes.pfp);
                newPost.set("postAcc", user?.attributes.ethAddress);
                newPost.set("postUsername", user?.attributes.username);
        
                await newPost.save();
            }

            setUploadedImageUri(nftImage._ipfs)
            setUploadedAudioUri(nftAudio._ipfs);

            executeContractFunction({
                params: {
                    abi: BLOCK_NEWS_MEDIA_CONTRACT_ABI,
                    contractAddress: CONTRACT_ADDRESS,
                    functionName: "createItem",
                    params: {
                        uriOfToken: nftMetadata._ipfs,
                    },
                    msgValue: Moralis.Units.ETH(0.01), // Change to 1 Matic when deploy on main net
                },
                onSuccess: () => {
                    saveAudio();
                },
                onError: (error) => {
                console.log("ERROR")
                }
            });
        } else {
            setIsNftMintInProcess(false);
            notification.error({
                message: "You need to have your wallet connected to Mint NFTs",
                description:
                    "In order to use this feature, you have to connect your wallet to this website.",
            });
        }
    };

    return (
        <div style={styles.container}>
            <Head>
                <title>Block News Media - Mint</title>
                <meta name="description" content="Block News Media - Mint" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main style={styles.main}>
                <Card
                    style={!isMobile ? styles.card : styles.mobileCard}
                    title={"Mint your Music as NFM"}
                    loading={isNftMintInProcess}
                >
                    <Text style={styles.text}>
                        Upload the Image that will represent your Music NFM (JPEG and PNG Files ONLY, max file size: 1GB)
                    </Text>
                    <NftImageUploader
                        getUploadedImageFile={(file) => setUploadedImageFile(file)}
                    />
                    <br />
                    <Text style={styles.text}>
                        Music Headline (NFM Title)
                    </Text>
                    <Input
                        placeholder="Audio Headline"
                        onChange={(e) => setTitleText(e.target.value)}
                        value={titleText}
                    />
                    <br />
                    <br />
                    <Text style={styles.text}>
                        Upload the Audio that will represent your Music NFM (max file size: 1GB)
                    </Text>
                    <NftAudioUploader
                        getUploadedAudioFile={(file) => setUploadedAudioFile(file)}
                    />
                    <br />
                    <div style={styles.inputContainer}>
                        <div style={styles.childInputContainer}>
                            <Text style={styles.text}>Genre</Text>
                            <Select
                                style={{ width: 155, marginLeft: "10px" }}
                                onChange={(e) => {
                                    setCategoryName(e);
                                }}
                            >
                                <Option value="Country">Country</Option>
                                <Option value="Electronic">Electronic</Option>
                                <Option value="Funk">Funk</Option>
                                <Option value="Hip Hop">Hip Hop</Option>
                                <Option value="Jazz">Jazz</Option>
                                <Option value="Latin">Latin</Option>
                                <Option value="Pop">Pop</Option>
                                <Option value="Punk">Punk</Option>
                                <Option value="Reggae">Reggae</Option>
                                <Option value="Rock">Rock</Option>
                                <Option value="Metal">Metal</Option>
                                <Option value="R&B">R&B</Option>
                                <Option value="Soul">Soul</Option>
                                <Option value="Rap">Rap</Option>
                            </Select>
                        </div>
                    </div>
                    <Button
                        style={styles.button}
                        type="primary"
                        loading={isNftMintInProcess}
                        onClick={async () => {
                            setIsNftMintInProcess(true);
                            await uploadNftToIpfsAndMintToken();
                        }}
                    >
                        Create NFT
                    </Button>
                </Card>
            </main>
        </div>
    );
}
