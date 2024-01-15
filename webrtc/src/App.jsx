import { useEffect ,useRef} from "react"
import {io} from "socket.io-client"

const socket = io (
  '/webRTCPeers',
  {
    path : '/webrtc-video-chat'
  }
)

const App = () => {
   const localVideoRef = useRef()
   const remoteVideoRef = useRef()
   const pc = useRef()
   const textRef = useRef()
   const candidates =useRef([])

   useEffect(() => {
    socket.on("connection-success" , success => {
      console.log(success)
    })

    socket.on('sdp',data => {
      console.log(data)
      textRef.current.value = JSON.stringify(data.sdp)
    })

    socket.on('candidate',candidate => {
      console.log(candidate)
      candidates.current = [...candidates.current,candidate]
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
      socket.emit('candidate',e.candidate)
    }

    _pc.onconnectionstatechange = e => {
      console.log(e)
    }

    _pc.onTrack =  e => {
        remoteVideoRef.current.srcObject = e.streams[0]
    }

    pc.current = _pc
   },[])

   const createOffer = () => {
    pc.current.createOffer().then(sdp =>{
         console.log(JSON.stringify(sdp))
         pc.current.setLocalDescription(sdp)

         socket.emit('sdp', {
          sdp
         })

    }).catch(e => console.log(e))
   }

   const createAnswer = () => {
    pc.current.createAnswer().then(sdp =>{
         console.log(JSON.stringify(sdp))
         pc.current.setLocalDescription(sdp)

         socket.emit('sdp',{
          sdp
         })
    }).catch(e => console.log(e))
   }

   const setRemoteDescription = () => {
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
   }

  
  return (
    <div className="m-10">
      <div className="flex">
     <video ref={localVideoRef} autoPlay className="w-60 h-60 bg-black-500 "></video>
     <video ref= {remoteVideoRef} autoPlay className="w-60 h-60 bg-black-500 "></video>
     </div>
     <br />
     <button onClick={createOffer} >CreateOffer</button>
     <button onClick={createAnswer} className="p-4">CreateAnswer</button>
     <br />
     <textarea ref={textRef}></textarea>
     <br/>
     <button onClick= {setRemoteDescription}>SetRemoteDescription</button>
     <button onClick= {addCandidate} className="p-4">AddCandidates</button>
    </div>
  )
}

export default App
