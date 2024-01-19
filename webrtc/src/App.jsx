import { useEffect ,useRef, useState} from "react"
import {io} from "socket.io-client"

const socket = io('http://localhost:8080/webRTCPeers', {
  path: '/webrtc-video-chat',
  query: {
    namespace: '/webRTCPeers',
  },
});

const App = () => {
   const localVideoRef = useRef()
   const remoteVideoRef = useRef()
   const pc = useRef()
   const textRef = useRef()
   const [offerVisible,setOfferVisible] = useState(true)
   const [answerVisible,setAnswerVisible] =useState(false)
   const [status,setStatus] = useState("Make a call now")

   useEffect(() => {
    socket.on("connection-success" , success => {
      console.log(success)
    })

    socket.on('sdp',data => {
      console.log(data)
      pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
      textRef.current.value = JSON.stringify(data.sdp)
      if(data.sdp.type === "offer")
      {
      setOfferVisible(false)
      setAnswerVisible(true)
      setStatus("Incoming Call")
    } else {
      setStatus('Call established')
    }
    })

    socket.on('candidate',candidate => {
      console.log(candidate)
      pc.current.addIceCandidate(new RTCIceCandidate(candidate))
    })

    const constraints = {
      audio:false,
      video:true
    }

    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
       localVideoRef.current.srcObject = stream

       stream.getTracks().forEach(track => {
          _pc.addTrack(track,stream)
       });
    })
    .catch(error => {
      console.log(error)
    })

    const _pc = new RTCPeerConnection(null)
    _pc.onicecandidate =(e)=> {
      console.log(JSON.stringify(e.candidate))
      sendToPeer('candidate',e.candidate)
    }

    _pc.onconnectionstatechange = e => {
      console.log(e)
    }

    _pc.ontrack =  e => {
        remoteVideoRef.current.srcObject = e.streams[0]
    }

    pc.current = _pc
   },[])

   const sendToPeer = (eventType,payload) => {
    socket.emit(eventType,payload)  
   }

   const processSdp = (sdp) => {
    console.log(JSON.stringify(sdp))
    pc.current.setLocalDescription(sdp)
    sendToPeer('sdp',{sdp})
    
   }

   const createOffer = () => {
    pc.current.createOffer().then(sdp =>{
       processSdp(sdp)
       setOfferVisible(false)
       setStatus("Calling...")

    }).catch(e => console.log(e))
   }

   const createAnswer = () => {
    pc.current.createAnswer().then(sdp =>{
         processSdp(sdp)
         setAnswerVisible(false)
         setStatus("Call Established")
    }).catch(e => console.log(e))
   }

   {/*const setRemoteDescription = () => {
         const sdp = JSON.parse(textRef.current.value)
         console.log(sdp);

         pc.current.setRemoteDescription(new RTCSessionDescription(sdp))

   }

   const addCandidate = () => {
    // const candidate = JSON.parse(textRef.current.value)
    // console.log(candidate)

    candidates.current.forEach(candidate => {
         console.log(candidate)
         pc.current.addIceCandidate(new RTCIceCandidate(candidate))
    })

    // pc.current.addIceCandidate(new RTCIceCandidate(candidate))
   }*/}

   const showHiddenButtons =() => {
    if(offerVisible){
      return <div>
        <button onClick ={ createOffer }>Call</button>
      </div>
    }

    if(answerVisible){
      return <div>
        <button onClick ={createAnswer}>Answer Call</button>
      </div>
    }
   }

  
  return (
    <div className="m-10">
      <div className="flex">
     <video ref={localVideoRef} autoPlay className="w-60 h-60 bg-black-500 "></video>
     <video ref= {remoteVideoRef} autoPlay className="w-60 h-60 bg-black-500 "></video>
     </div>
     {/*<br />
     <button onClick={createOffer} >CreateOffer</button>
     <button onClick={createAnswer} className="p-4">CreateAnswer</button>
  <br />*/}
  {showHiddenButtons()}
  <div>{status}</div>
     <textarea ref={textRef}></textarea>
     {/*<br/>
     <button onClick= {setRemoteDescription}>SetRemoteDescription</button>
  <button onClick= {addCandidate} className="p-4">AddCandidates</button>*/}
    </div>
  )
}

export default App

