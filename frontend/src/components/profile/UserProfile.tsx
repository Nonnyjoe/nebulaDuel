import { useCallback, useEffect, useState } from "react";
import { Text } from "../atom/Text";
import userImg from "../../assets/img/team01.png";
import { ImageWrap } from "../atom/ImageWrap";
import { Button } from "../atom/Button";
import { toast } from "sonner";
import signMessages from "../../utils/relayTransaction.tsx"
// import readGameState from "../../utils/readState.js";
import axios from "axios";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from 'react-router-dom';
import { useProfileContext } from "../contexts/ProfileContext.js";
import fetchNotices from "../../utils/readSubgraph.js";
// import readGameState from "../../utils/readState.tsx";


const UserProfile = () => {
  const [createdProfile, setCreatedProfile] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [, setUserAddress] = useState('');
  const [profileData, setProfileData] = useState<any>({});
  const [uploading, setUploading] = useState<boolean>(false);
  const navigate = useNavigate();
  const userAccount = useActiveAccount();
  const {profile, setProfile} = useProfileContext();

  const fetchData = async () => {
    let request_payload = await fetchNotices("all_profiles");
    request_payload = request_payload.filter((player: any) => player.wallet_address == userAccount?.address.toLowerCase());
    if (request_payload.length > 0) {
        setProfile(request_payload[0]);
        console.log(request_payload[0], 'user profile data');
          setProfileData(request_payload[0]);
          setCreatedProfile(true);
    } else {
        setCreatedProfile(false);   
    }
}

  useEffect(() => {
    const getAllData = async() => {
        await fetchData(); 
        const address = userAccount?.address;
        if (userAccount && address) {
            setUserAddress(address);
            if (address.toLowerCase() == profile?.wallet_address?.toLowerCase()) {
                console.log(profile, 'user profile data');
                setProfileData(profile);
                setCreatedProfile(true);
            } else {
                setCreatedProfile(false);   
            }
        }
    }

    getAllData()

  }, [userAccount, navigate]);



  const handleNameChange = (event: any) => {
    setName(event.target.value);
  }

  const handleSetCreatedProfile = async (e: any) => {
    e.preventDefault();
    if (imgUrl) {
      createProfile();
    } else {
        toast.error("Please upload an avatar before creating a profile");
    }
  }

  const handleAvatarChange = async (event: any) => {
    if (event.target.files && event.target.files[0]) {
      setAvatar(event.target.files[0]);
      getAvatar(event.target.files[0]);
    }
  };

  const getAvatar = useCallback(async (avatar: any) => {
    toast.info("Sending avatar to Ipfs...");
    setUploading(true);

    if(avatar) {
        console.log(avatar, 'avatar is already set');
      try {
        const formData = new FormData();
        formData.append("file", avatar!);

        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
              pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
            },
          }
        );

        const avatarUrl = response.data.IpfsHash;
        if (avatarUrl) {
          setImgUrl(`https://orange-personal-vulture-360.mypinata.cloud/ipfs/${avatarUrl}`);
          toast.success("Successfully uploaded image to Ipfs, click the button to continue...");
        }
        setUploading(false);
      } catch(err) {
        console.log('Pinata API error', err);
        toast.error('upload error');
        setUploading(false);
      }
    }
    console.log(imgUrl, 'avatar url');
    setUploading(false);
  }, [avatar]);


  function getArrayLength(jsonString: string): number | null {
    try {
        // Parse the JSON string to an array of objects
        const array: { char_id: number }[] = JSON.parse(jsonString);
        
        // Check if the parsed result is indeed an array
        if (Array.isArray(array)) {
            // Return the length of the array
            return array.length;
        } else {
            throw new Error('Parsed result is not an array');
        }
    } catch (error: any) {
        // console.error('Error parsing JSON string:', error.message);
        return null;
    }
}
  async function createProfile() {
    console.log(name, imgUrl, 'profile data')
    const togglePlayer = { "func": "create_player", "monika": name, "avatar_url": imgUrl };

    setUploading(true);
    try {
         const txhash = await signMessages(togglePlayer);
        if (txhash.message === "Transaction added successfully") {
            let request_payload = await fetchNotices("all_tx");
            request_payload = request_payload.filter((tx: any) => tx.caller == userAccount?.address.toLowerCase());
            if (request_payload.length > 0) {
                console.log(request_payload);
                toast.success("Transaction Successful.. Profile Created", {
                position: 'top-right'
             })
            }
            navigate("/");
        }

    } catch(err) {
        toast.error("Transaction Failed.. Try again later.", {
            position: 'top-right'
        });
        setUploading(false);
        // setSubmiting(false);
        console.log(err)
        return;
    }
    setUploading(false);
    }


  return (
    <section className="w-full h-auto bg-bodyBg">
      <main className="w-full lg:py-32 md:py-24 py-20 px-6 flex flex-col items-center gap-4">
        <Text
          as="h2"
          className="font-bold text-center uppercase lg:text-5xl md:text-4xl text-2xl font-barlow"
        >
          Create your profile
        </Text>
        <Text
          as="p"
          className="font-bold text-center text-lg text-gray-400 font-barlow"
        >
          Are you ready to be a Gamer? Create your profile and let's get started
        </Text>
        <div className="w-20 h-1.5 bg-myGreen"></div>

        <section className="lg:w-[70%] w-full md:mt-20 mt-12 grid md:grid-cols-2 gap-4">
          <div className="w-full h-auto relative lg:px-12 px-3">
            <div className="text-center border shadow-[0px_3px_13px_0px_rgba(0,0,0,0.17)] relative transition-[0.3s] duration-500 overflow-hidden z-[1] mt-0 mb-[30px] mx-0 pt-[30px] pb-[35px] px-[25px] rounded-xl border-solid border-[#27313f] bg-[#1c242f] before:content-[''] before:absolute before:top-[-60px] before:w-[70px] before:h-80 before:rotate-[-55deg] before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s] before:opacity-[0.55] before:z-[-1] before:left-0 before:bg-[#45f882] after:content-[''] after:absolute after:top-[-60px] after:w-[70px] after:h-80 after:rotate-[55deg] after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:delay-[0s] after:opacity-[0.55] after:z-[-1] after:left-auto after:right-0 after:bg-[#45f882] hover:translate-y-[-7px] hover:before:opacity-[1] hover:after:opacity-[1] group sm:before:!h-[295px] sm:before:!-top-12 sm:after:!h-[295px] sm:after:!-top-12 xsm:before:!h-[295px] xsm:before:!-top-12 xsm:after:!h-[295px] xsm:after:!-top-12 xsm:m-[0_auto_30px] xsm:max-w-[320px]">
              <div className="mt-0 mb-[33px] mx-0 after:right-[75px] group-hover:before:opacity-40 group-hover:after:opacity-40 before:content-[''] before:absolute before:top-[-50px] before:w-px before:h-[260px] before:rotate-[-55deg] before:transition-all before:duration-[0.3s] before:ease-[ease-out] before:delay-[0s] before:z-[-1] before:opacity-20 before:left-[75px] before:bg-[#45f882] after:content-[''] after:absolute after:top-[-50px] after:w-px after:h-[260px] after:rotate-[55deg] after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:delay-[0s] after:z-[-1] after:opacity-20 after:left-auto after:bg-[#45f882]">
                {profileData.avatar_url ? (
                  <img
                    src={ profileData.avatar_url || userImg}
                    // onError={(e) => console.log('Image load error:', e)}
                    onError={(e: any) => { e.currentTarget.src = userImg; console.log('Image load error' ,e); }}
                    className="inline-block sm:max-w-full xsm:max-w-full border-[#fff] max-w-[224px] rounded-[50%] border-[3px] border-solid shadow-[0px_3px_7px_0px_rgba(0,0,0,0.21),inset_0px_3px_9px_0px_rgba(0,0,0,0.92)]"
                    alt="Avatar"
                  />
                ) : (
                  <ImageWrap
                    className="inline-block"
                    image={userImg}
                    alt="user avatar"
                    objectStatus="sm:max-w-full xsm:max-w-full border-[#fff] max-w-[224px] rounded-[50%] border-[3px] border-solid shadow-[0px_3px_7px_0px_rgba(0,0,0,0.21),inset_0px_3px_9px_0px_rgba(0,0,0,0.92)]"
                  />
                )}
              </div>
              <div className="team__content">
                <h4 className="text-[20px] font-extrabold tracking-[1px] mt-0 mb-px mx-0 text-gray-200">
                  {
                    profileData.monika || "KILLER MASTER"
                  }
                </h4>
                <span className="block font-semibold text-[16px] text-[#45f882] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] font-Barlow">
                  Player
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <Text
                  as="p"
                  className="text-gray-400 text-base font-belanosima"
                >
                  No of Characters:{" "}
                  <Text
                    as="span"
                    className="text-myGreen/70 font-poppins"
                  >
                    {getArrayLength(profileData.characters) || 0}
                  </Text>
                </Text>
                <Text
                  as="p"
                  className="text-gray-400 text-base font-belanosima"
                >
                  Game Points:{" "}
                  <Text
                    as="span"
                    className="text-myGreen/70 font-poppins"
                  >
                    {profileData.points || 0} pts
                  </Text>
                </Text>
                <Text
                  as="p"
                  className="text-gray-400 text-base font-belanosima"
                >
                  Nebula Balance:{" "}
                  <Text
                    as="span"
                    className="text-myGreen/70 font-poppins"
                  >
                    {profileData.nebula_token_balance || 0} $Neb
                  </Text>
                </Text>
              </div>
            </div>
          </div>

          <aside>
            {!createdProfile ? (
              <form className="w-full">
                <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-[#262f39] after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                  <label
                    htmlFor="name"
                    className="text-gray-400 font-belanosima"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name *"
                    className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                    required
                    value={name}
                    onChange={handleNameChange}
                  />
                </div>

                <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-[#262f39] after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                  <label
                    htmlFor="profile"
                    className="text-gray-400 font-belanosima"
                  >
                    Upload Avatar
                  </label>
                  <input
                    type="file"
                    name="profile"
                    placeholder="Upload avatar *"
                    accept="image/*"
                    className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                    required
                    disabled={uploading}
                    onChange={handleAvatarChange}
                  />
                </div>
                <Button
                  type="button"
                  className={`text-[#0f161b] uppercase font-bold tracking-[1px] px-[30px] py-3.5 border-[none] ${imgUrl ? 'bg-[#45f882] hover:bg-[#ffbe18]' : 'bg-[#45f882] opacity-50 cursor-not-allowed'} font-Barlow clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]`} 
                  disabled={uploading}
                  onClick={handleSetCreatedProfile}
                >
                 {uploading ? 
                        (<div className="animate-spin rounded-full ml-auto mr-auto h-6 w-6 border-t-2 border-b-2 border-yellow-900"></div>)
                   : "Create Profile"} 
                </Button>
              </form>
            ) : (
              <form className="w-full">
                <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-[#262f39] after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                  <label
                    htmlFor="name"
                    className="text-gray-400 font-belanosima"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name *"
                    className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                    required
                    value={name}
                    onChange={handleNameChange}
                  />
                </div>

                <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-[#262f39] after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                  <label
                    htmlFor="profile"
                    className="text-gray-400 font-belanosima"
                  >
                    Upload Avatar
                  </label>
                  <input
                    type="file"
                    name="profile"
                    placeholder="Upload avatar *"
                    accept="image/*"
                    className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-[25px] py-3.5 border-2 border-solid border-[#19222b] bg-transparent placeholder:opacity-80 focus:!border-[#19222b] focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                    required
                    disabled={uploading}
                    onChange={handleAvatarChange}
                  />
                </div>
                <Button
                  className={`text-[#0f161b] uppercase font-bold tracking-[1px] px-[30px] py-3.5 border-[none] ${imgUrl ? 'bg-[#45f882] hover:bg-[#ffbe18]' : 'bg-[#45f882] opacity-50 cursor-not-allowed'} font-Barlow clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]`}
                  onClick={handleSetCreatedProfile}
                  disabled={uploading}
                >
                  {uploading ? 
                        (<div className="animate-spin rounded-full ml-auto mr-auto h-6 w-6 border-t-2 border-b-2 border-yellow-900"></div>)
                   :createdProfile ? "Update Profile" : "Create Profile"} 
                </Button>
              </form>
            )}
          </aside>
        </section>
      </main>
    </section>
  );
};

export default UserProfile;