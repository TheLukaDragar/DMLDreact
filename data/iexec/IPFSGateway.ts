
import { Buffer } from 'buffer';
import { utils } from 'ethers';
import aesJs from 'aes-js';
import * as FileSystem from 'expo-file-system';

const { randomBytes, sha256 } = utils;

export const generateAes256Key = () =>
  Buffer.from(randomBytes(32)).toString('base64');

export const encryptAes256Cbc = async (fileBytes:any, base64Key:any) => {
  const keyBuffer = Buffer.from(base64Key, 'base64');
  const fileBuffer = Buffer.from(fileBytes);

  const ivBuffer = Buffer.from(randomBytes(16));

  const aesCbc = new aesJs.ModeOfOperation.cbc(Array.from(keyBuffer), Array.from(ivBuffer));

  const pkcs7PaddingLength = 16 - (fileBuffer.length % 16);
  const pkcs7PaddingBuffer = Buffer.alloc(
    pkcs7PaddingLength,
    pkcs7PaddingLength,
  );

  const paddedFileBuffer = Buffer.concat([fileBuffer, pkcs7PaddingBuffer]);

  const encryptedFileBuffer = Buffer.from(aesCbc.encrypt(Array.from(paddedFileBuffer)));

  return Buffer.concat([ivBuffer, encryptedFileBuffer]);
};

export const sha256Sum = async (fileBytes:any) => {
  const fileBuffer = Buffer.from(fileBytes);
  return sha256(fileBuffer);
};

export const IPFSGateways ={ 
    IExecGateway: "https://ipfs.iex.ec/ipfs/" 
  };
  
  export interface IpfsData{
    Name :string,
    Hash : string,
  }
  export interface IpfsError {
    Message : string,
    Code : number,
    Type : string, 
  }
  export type IpfsDataOrError = IpfsData |IpfsError;
  
  export async function downloadFromIPFS<T>(ipfsUri : string) : Promise<T>
  {
    const res = await fetch(ipfsUri)
    let receivedObject :T;
    let text;
    try {
      text = await res.text();
      receivedObject = JSON.parse(text) as T;
    } catch(err){
      throw new Error("could not parse json, got text instead: " + JSON.stringify(err) + " parsed text:" + text + "  ");
    }
    return receivedObject;
  }
  function isIpfsData( toBeDetermined : IpfsDataOrError) : toBeDetermined is IpfsData{
    if ( (toBeDetermined as IpfsData).Hash ){
      return true;
    }
    return false;
  }
  
  export async function uploadToIPFSTesting(data :Buffer ) : Promise<IpfsData>{
    const result = await callIpfsCommandTesting(data);
    //let url = IPFSGateways.IExecGateway + result.Hash;
    return result;
  }

  export async function uploadToIPFS(data :Buffer) : Promise<IpfsData>{
    const result = await callIpfsCommand(data);
    //let url = IPFSGateways.IExecGateway + result.Hash;
    return result;
  }
  
  async function callIpfsCommandTesting(data : Buffer) : Promise<IpfsData>{

    const formData = new FormData();

    //print type of data and 
    console.log("data", data);
    console.log("typeof data", typeof data);
    console.log("data instanceof Blob", data instanceof Blob);
    console.log("data instanceof File", data instanceof File);

    const blob = new Blob([new Uint8Array(data)], {type: 'application/octet-stream'});

    
    formData.append("file" , blob, "metadata.txt");
  
    const options = {
      method: 'POST',
      headers:{
        Accept: "application/json"
      },
      mode: "cors",
      body: formData,
    } as RequestInit ;
  
    let res = await fetch("https://ipfs-upload.iex.ec/api/v0/add?stream-channels=true&progress=false", options)


    
    let json = await res.json();
  console.log("json", json);
  
  
    if(isIpfsData(json)){
      return json;
    }else if( (json as IpfsError).Message){
      throw new Error (json.Message);
    } else {
      throw new Error("error parsing result " + JSON.stringify(json));
    }
  }

  async function callIpfsCommand(data : Buffer) : Promise<IpfsData>{

    // Generate a temporary filename in the app's document directory
    const dataString = data.toString();

    const filename = FileSystem.documentDirectory +'metadata' + '.txt';

  // Write your data to the file
    await FileSystem.writeAsStringAsync(filename, dataString, { encoding: FileSystem.EncodingType.UTF8 });

    //compute sha256

    // //get file to blob 
    // const blob = await FileSystem.readAsStringAsync(filename, { encoding: FileSystem.EncodingType.UTF8 });
    // const blobBuffer = Buffer.from(blob);
    // //compute sha256
    // const sha256Hash = await sha256Sum(blobBuffer);
    // console.log("sha256Hash2", sha256Hash);

    // //compute hash of data
    // const dataBuffer = Buffer.from(dataString);
    // const sha256Hash2 = await sha256Sum(dataBuffer);
    // console.log("sha256Hash3", sha256Hash2);




   
  
    const options = {
      method: 'POST',
      headers:{
        Accept: "application/json"
      },
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
    };
    const res = await FileSystem.uploadAsync('https://ipfs-upload.iex.ec/api/v0/add?stream-channels=true&progress=false', filename, options);

    await FileSystem.deleteAsync(filename);

    //let res = await fetch("https://ipfs-upload.iex.ec/api/v0/add?stream-channels=true&progress=false", options)

    if(!res.status || res.status !== 200){
      throw new Error("error uploading to ipfs: " + res.status);
    }

    let json = JSON.parse(res.body);
  console.log("json", json);
  
    if(isIpfsData(json)){
      return json;
    }else if( (json as IpfsError).Message){
      throw new Error (json.Message);
    } else {
      throw new Error("error parsing result " + JSON.stringify(json));
    }
  }



