import './App.css';
import {Container, Row, Col, Button, Modal, Badge, InputGroup, FormControl, DropdownButton, Dropdown, Spinner, Form} from 'react-bootstrap'
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
const crypto = require('crypto');

const url = "http://10.221.224.233:4001/" 


const removeAmp = input => {
  const type = typeof(input)
  console.log(type)
  let output = input;
  if (type === "object") {
    output = input.map(str => {
      if (str.includes("&")){
         str = str.replace("&", "%26")
      }
      return str
    })
  } else if (type === "string") {
    if (input.includes("&")) {
      output = input.replace("&", "%26")
    }
  }
  console.log(output)

  return output;
}
async function getKeys() {
  
  return fetch(url + "keys", {
    method: "GET",
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      console.log(response)
    }
  }).then((response) => response)
}
async function login(props) {
  return fetch (url + "login", {
    method: "POST",
    body: "passphrase=" + props,
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      return false
    }
  }).then((response) => {
    if (!response) {
      return false;
    } else {
      if (response.login){ // note that response contains the type of account allowing
        // for an admin panel that allows addition of users and the loaning/returning of keys and
        // a user panel that can only view and possibly issue
        return true
      } else {
        return false
      }
    }
  })
}

async function getKeyTypes(){
  return fetch(url + "keyTypes", {
    method: "GET",
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      console.log(response)
    }
  }).then((response) => response)
}

async function updateKey(_idToUpdate, newKey){
  const toUpdate = {
    _idToUpdate: _idToUpdate,
    updatedKey: newKey
  };
  return fetch(url + "updateKey", {
    method: "POST",
    body: "toUpdate=" + JSON.stringify(toUpdate),
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
  }).then(response => {
    console.log(response)
  })
}

async function  updateKeyTypes(props) {
  const cleanProps = removeAmp(props)
  const body = 'newKeyTypes=' + JSON.stringify(cleanProps)
  console.log(body)
  fetch (url + "updateKeyTypes", {
    method: "POST",
    body:body,
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then(response => {
    if (response.ok) {
      return response.json()
    }
  }).then(response => {
    console.log(response)
  })
}

async function getKeyHistory(props) {
  return fetch(url + "keyHistory", {
    method: "POST", // should change this over to a GET request and just put the id in the url
    body: "_id=" + props,
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
  }).then(response => {
    return response.response
  })
}
async function issueDbUpdate(props) {
  const toUpdate = {
    _id: props._id,
    newOwner: props.owner
  }
  return fetch(url + "issueKey", {
    method: "POST",
    body : "toUpdate=" + JSON.stringify(toUpdate),
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then((response) => {
    if (response.ok) {
    } else {
      console.log(response)
    }
  })
}

async function returnDbUpdate(props) {
  const  toUpdate = {
    _id: props
  }
    return fetch(url + "returnKey", {
    method: "POST",
    body: "toUpdate=" + JSON.stringify(toUpdate),
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then((response) => {
    if (response.ok) {

    } else {
      console.log(response)
    }
  })
}

async function keyDbUpdate(props, functions) {
  const typeClean = removeAmp(props.type)
  const body = {
    number: props.number,
    type: typeClean,
    owner: props.owner,
    issueDate: props.issueDate,
    returnDate: props.returnDate,
  }
  await fetch(url + "addKey", {
    method: "POST",
    body: "toAdd=" + JSON.stringify(body),
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then((response) => {
    if (response.ok) {
        return response.json()
    } else {
      console.log(response[0])
    }
  }).then (response => {
    body._id = response.key_id;
    body.type = props.type;
    const filterVars = functions.filterVars
    const trueKeyList = functions.updateTrueKeyList(null, "add", body)
    functions.setTrueKeyList(trueKeyList);
    const updatedFilter = functions.updateFilter(filterVars, trueKeyList)
    functions.setKeyList(updatedFilter)
    
  })
}

async function archiveDbUpdate(props) {
  fetch(url + "archive", {
    method: "POST",
    body: "toArchive=" + JSON.stringify(props),
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then(response => {
    if (response.ok) {
      console.log(response.json())
    }
  })
}

function KeyTypeDropdown(props) {
  const keyTypes = props.children.keyTypes
  const setNewKeyType = props.children.setNewKeyType;
  const newKeyType = props.children.newKeyType;
  let tempArray = []
  keyTypes.map(keyType => {
    const keyDropdown = <Dropdown.Item key={keyType} name="type" onClick={() => setNewKeyType(keyType)}>{keyType}</Dropdown.Item>
    tempArray.push(keyDropdown)
  })
  tempArray = (
    <DropdownButton title={newKeyType}>
      {tempArray}
    </DropdownButton>
  )
  return(tempArray)
}

function AddModal(props) {
  const [checkDisabled, setCheckDisabled] = useState(false) 
  const [newKeyNumber, setNewKeyNumber] = useState("")
  const [newKeyType, setNewKeyType] = useState("")
  const [newKeyOwner, setNewKeyOwner] = useState("")
  const [typeOther, setTypeOther] = useState(false)
  const resetModal = () => {
    setCheckDisabled(false)
    setNewKeyNumber("")
    setNewKeyType("")
    setNewKeyOwner("")
    setTypeOther(false)
  }
  const handleChange = e => {
    const { target : {value, name} } = e
    switch (name) {
      case "number":
        if (value !== null && value !== "") {
          if (setNewKeyNumber(parseInt(value) !== NaN)) {
            setNewKeyNumber(parseInt(value))
          }
          else {
            setNewKeyNumber(value)
          }
          setCheckDisabled(false)
        } else if (!checkDisabled){
          setNewKeyNumber(value)
          setCheckDisabled(true)
        }
        break;
      case "owner":
        setNewKeyOwner(value)
        break;
      case "typeOther":
        setNewKeyType(value)
        break;
      default:
   }
    
  }
  const enterSubmit = e => {
    if (e.charCode === 13) {
      prepKey()
    }
  }
  const prepKey = () => {
    let newKey = {
      type: newKeyType,
      number: newKeyNumber,
      owner: newKeyOwner,
      issueDate: "",
      returnDate: ""
    }
    if (newKey.owner != null && newKey.owner != ""){
      newKey.issueDate = new Date().toDateString()
    }
    props.children.newKey(newKey)
    props.onHide()
    resetModal()

  }
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Add Key
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>Key Type</Col>
          <Col>Key #</Col>
          <Col>Issued To</Col>
        </Row>
        <Row>
          {!typeOther &&
            <Col className="justify-content-md-center">
              <KeyTypeDropdown 
                children={{
                  keyTypes: props.children.keyTypes,
                  newKeyType: newKeyType,
                  setNewKeyType: newKeyType => setNewKeyType(newKeyType)
                }}
              />
            </Col>
          }
          {typeOther &&
            <Col>
              <InputGroup>
                <FormControl value={newKeyType} name="typeOther" onChange={handleChange}/>
                <Button onClick={() => setTypeOther(false)}>Reset</Button>
              </InputGroup>
              
            </Col>
          }
          <Col>
            <InputGroup>
              <FormControl value={newKeyNumber} name="number" onChange={handleChange}  aria-label="With textarea" />
            </InputGroup>
          </Col>
          <Col>
            <InputGroup>
              <FormControl placeholder="Leave blank if not issued" name="owner" onChange={handleChange} aria-label="Issued to " onKeyPress={enterSubmit}/>
            </InputGroup>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
        <Button disabled={checkDisabled} onClick={prepKey} >Add</Button>
      </Modal.Footer>
    </Modal>
  )
}

function ListKeyTypes(props) {
  const keyTypes = props.children.keyTypes;
  let tempArray = [];
  keyTypes.map((keyType, index) => {
    tempArray.push(
      <Badge size="lg" variant="secondary" pill key={keyType}>
        <Col>
          {keyType}
          {' '}
          <Button size='sm' variant="secondary" value={index}  name={keyType} onClick={props.children.removeKeyType}>x</Button>
        </Col>
      </Badge>
    )
  })
  tempArray = (
    <>
      {tempArray}
    </>
  )
  return tempArray
}

function KeyTypeAdmin(props) {
  const keyTypes = props.children.keyTypes;
  const setKeyTypes = props.children.setKeyTypes;
  const [newKeyType, setNewKeyType] = useState("")
  const resetModal = () => {
    setNewKeyType("")
  }
  const removeKeyType = e => {
    const {target: {value, name}} = e;
    const preSplit = keyTypes.slice(0, value)
    const postSplit = keyTypes.slice(parseInt(value) + 1)
    const newKeyTypes = preSplit.concat(postSplit)
    setKeyTypes(newKeyTypes)
    updateKeyTypes(newKeyTypes)
  }
  const addKeyType = () => {
    let newKeyTypes = keyTypes
    newKeyTypes.push(newKeyType)
    updateKeyTypes(newKeyTypes);
    setKeyTypes(newKeyTypes);
    resetModal();
  }
  const enterSubmit = e => {
    if (e.charCode === 13) {
      addKeyType()
    }
  }
  const handleChange = e => {
    const {target: {value}} = e;
    setNewKeyType(value)
  }
  return (
    <>
      <Row>
        <Col xs={12} >
          <div style={{"borderBottom": "solid", "borderColor":"grey"}}>
            Key Types              
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Add Type</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl value={newKeyType} onChange={handleChange} onKeyPress={enterSubmit}></FormControl>
          <InputGroup.Append>
            <Button onClick={() => addKeyType()}>Add</Button>
          </InputGroup.Append>
        </InputGroup>
        </Col>
        <Col xs={6}>
          
          <Row>
            <Col>
              <ListKeyTypes 
                children={{
                  keyTypes: keyTypes,
                  removeKeyType: removeKeyType
                }}
              />
            </Col>
            {/* use pills to list out all of the existing types */}
          </Row>
        </Col>
      </Row>
    </>
  )
}

function AdminModal(props) {
  const keyTypes = props.children.keyTypes;
  const setKeyTypes = props.children.setKeyTypes;
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Admin
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <KeyTypeAdmin 
          children={{
            keyTypes: keyTypes,
            setKeyTypes: setKeyTypes
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
        {/* <Button disabled={checkDisabled} onClick={submitIssue}>Add</Button> */}
      </Modal.Footer>
    </Modal>
  )
}

function IssueModal(props) {
  const [newOwner, setNewOwner] = useState(null)
  const [checkDisabled, setCheckDisabled] = useState(true)
  const issueModalIndex = props.children.issueModalIndex

  const handleChange = e => {
    const { target : {value, name} } = e
    setNewOwner(value)
    if (value !== "" && value != null) {
      setCheckDisabled(false)
    } else {
      setCheckDisabled(true)
    }

  }
  const resetModal = () =>{
    setNewOwner("");
    setCheckDisabled(true);
  }
  const submitIssue = () => {
    if (newOwner !== null && newOwner !== ""){
      props.children.issueFunc({newOwner,issueModalIndex})
      resetModal()
    }
  }
  const enterSubmit = e => {
    if (e.charCode === 13) {
      submitIssue()
    }
  }
  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Issue Key
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col>
          <InputGroup>
            <FormControl onChange={handleChange} onKeyPress={enterSubmit}/>
          </InputGroup>
        </Col>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
        <Button disabled={checkDisabled} onClick={submitIssue}>Add</Button>
      </Modal.Footer>
    </Modal>
  )
}
function KeyHistory(props) {
  const [keyHistoryLoading, setKeyHistoryLoading] = useState(false) 
  const [keyHistoryLoaded, setKeyHistoryLoaded] = useState(false)
  const [outputArray, setOutputArray] = useState([])
  const _id = props.children.key._id

  useEffect(async () => {
    if (!keyHistoryLoading) {
      setKeyHistoryLoading(true);
      const localKeyHistory = await getKeyHistory(_id);
      if (typeof(localKeyHistory) === "object" ) {
        autofill(localKeyHistory)
        setKeyHistoryLoaded(true);
      } else {
        setOutputArray((
          <Row>
            <Col> 
              No history for this key
            </Col>
          </Row>
        ))
        setKeyHistoryLoaded(true)
      }
    }
  })
  const autofill = localKeyHistory => {
    let temp = [];
    // const tempKeyHistory = keyHistory;
    localKeyHistory.slice(0).reverse().map(key => {
      temp.push(
        <div key={key._id}>
        <hr style={props.children.hrStyle} />
        <Row>
          <Col>{key.owner}</Col>
          <Col>{key.issueDate}</Col>
          <Col>{key.returnDate}</Col>
        </Row>
        </div>
      )
    })
   setOutputArray(temp)
  }

  if (!keyHistoryLoaded && keyHistoryLoading) {
    return (
      <>
        Loading History...{' '}
        <Spinner size="sm" animation="border" role="status">
          <span ></span>
        </Spinner>
      </>
    )
  } else {
    return (
      <>
        {outputArray}
      </>
    )
  }
  
}

function KeyModal(props) {
  const key = props.children.key;
  const temp = {
    _id: key._id,
    type: key.type,
    number: key.number,
    owner: key.owner,
    issueDate: key.issueDate,
    returnDate: key.returnDate
  }
  const [modifyKey, setModifyKey] = useState("");
  if (temp._id !== undefined && modifyKey === "") {
    setModifyKey(temp)
  } else if (modifyKey._id !== key._id ) {
    setModifyKey(temp)
  }
  const updateKey = () => {
    props.children.updateKeyList(modifyKey)
  }
  const hrStyle = {
   "backgroundColor": "black",
  }
  const handleChange = e => {
    const { target: {value, name}} = e;
    var tempKey = temp
    switch(name) {
      case 'keyType': 
        tempKey.type = value
        setModifyKey(tempKey) 
        break;
      case 'keyOwner':
        tempKey.owner = value
        setModifyKey(tempKey)
        break;
      case "keyIssueDate":
        tempKey.issueDate = value
        setModifyKey(tempKey)
        break;
      case "keyNumber":
        tempKey.number = value
        setModifyKey(tempKey)
      default:
        break;
    }
  }
  return (
    <Modal 
      {...props}
      aria-labelledby="contained-modal-tittle-vcenter"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Key: {modifyKey.number}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            Key Type:
            <InputGroup>
              <FormControl name="keyType" value={modifyKey.type} onChange={handleChange}></FormControl>
            </InputGroup>
          </Col>
          <Col>
            Issued To:
            <InputGroup>
              <FormControl name="keyOwner" value={modifyKey.owner} onChange={handleChange}></FormControl>
            </InputGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            Key Number:
            <InputGroup>
              <FormControl name="keyNumber" value={modifyKey.number} onChange={handleChange}></FormControl>
            </InputGroup>
          </Col>
          <Col>
            Issue Date:
            <InputGroup>
              <FormControl name="keyIssueDate" value={modifyKey.issueDate} onChange={handleChange}></FormControl>
            </InputGroup>
          </Col>
        </Row>
        <br />
        <Row>
          <Button block onClick={updateKey}>
            Update
          </Button>
        </Row>
        
        <br />
        <Row>
          <Col><h4>History</h4></Col>
        </Row>
        <Row>
          <Col>
            Issued to:
          </Col>
          <Col>
            Issue date:
          </Col>
          <Col >
            Return date:
          </Col>
        </Row>
        <KeyHistory
          children={{
            hrStyle: hrStyle,
            key: modifyKey
          }}
        />
      </Modal.Body>
    </Modal>
  )
}

function KeyFormat(key, index, functions, keyModal) {
  const onClickHandler = () => {
    functions.keyIndex(index)
    functions.issueModal(index)
  }
  return (
    <div key={index}>
      <hr />
      <Row>
        <Col>{key.type}</Col>
        <Col>{key.number}</Col>
        <Col>{key.owner}</Col>
        <Col>{key.issueDate}</Col>
        <Col>{key.returnDate}</Col>
        <Col>
          {key.owner !== "" && key.owner !== null &&
            <Button block variant="warning" onClick={() => functions.returnFunc(index)}>Return</Button>
          }
          {key.owner === "" && key.owner !== null &&
            <Button block variant="success" onClick={onClickHandler}>Issue Key</Button>
          }
        </Col>
      </Row>
      <Row>
        <Col>
            {/* <Button block variant="outline-info" >details</Button> */}
            <Button block variant="info" onClick={() => keyModal(index)}>details</Button>

          </Col>
      </Row>
    </div>
  )
}

function ListKeys(props) {
  var keyOutput;
  const setKeyList = props.children.setKeyList
  const keyList = props.children.keyList
  const updateTrueKeyList = props.children.updateTrueKeyList;
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [modalKey, setModalKey] = useState({})
  const [keyModalIndex, setModalKeyIndex] = useState(-1)
  const functions = {
    returnFunc: props.children.returnFunc,
    issueModal: props.children.issueModal,
    keyIndex: props.children.keyIndex,
  }
  const keyModal = (index) => {
    setModalKey(keyList[index])
    setModalKeyIndex(index)
    setShowKeyModal(true)
  }
  keyOutput = keyList.map(((key, index) =>
    KeyFormat(key, index, functions, keyModal)
  ))
  const updateKeyList = (newKey) => {
    let tempKeyList = [...keyList];
    const _idToUpdate = tempKeyList[keyModalIndex]._id;
    const tempKey = tempKeyList[keyModalIndex];
    updateTrueKeyList(_idToUpdate, "update", newKey)
    tempKeyList[keyModalIndex] = newKey
    updateKey(_idToUpdate, newKey)
    setKeyList(tempKeyList)
    setShowKeyModal(false)
  }
  return(
    <>
      {keyOutput}

      <KeyModal
        show={showKeyModal}
        onHide={() => setShowKeyModal(false)}
        children = {{
          key: modalKey,
          updateKeyList: newKey => updateKeyList(newKey)
        }}
      />
    </>
  )
}

const updateFilter = (filters, trueKeyList) => {
    let filterList = {
      type: [],
      number:[],
      owner:[],
      issueDate:[],
      returnDate:[]
    }
    trueKeyList.map(key => {
      Object.entries(filters).map(filter => {
        if (filter[1] !== "" && filter[1] !== null && filter[1] !== undefined) {
          switch (filter[0]) {
            case "typeFilter":
              if (key.type.includes(filter[1])){
                filterList.type.push(key._id);
              }
              break;
            case "numberFilter":
              if (key.number.toString().includes(filter[1])){
                filterList.number.push(key._id);
              }
              
              break;
            case "ownerFilter":
              if (filter[1] === "0" && key.owner === "") {
                filterList.owner.push(key._id)
              } else if (filter[1] === "1" && key.owner !== "") {
                filterList.owner.push(key._id)
              } else {

                if (key.owner.includes(filter[1])) {
                  filterList.owner.push(key._id);
                }
              }
              break;
            case "issueDateFilter":
              if (key.issueDate.includes(filter[1])) {
                filterList.issueDate.push(key._id);
              }
              break;
            case "returnDateFilter":
              if (key.returnDate.includes(filter[1])) {
                filterList.returnDate.push(key._id);
              }
              break;
            default:
              break;
          }
        } else {
          switch (filter[0]) {
            case "typeFilter":
              filterList.type = null;
              break;
            case "numberFilter":
              filterList.number = null;
              break;
            case "ownerFilter":
              filterList.owner = null;
              break;
            case "issueDateFilter":
              filterList.issueDate = null;
              break;
            case "returnDateFilter":
              filterList.returnDate = null;
              break;
            default:
              break;

          }
        }
      })
    })
    let filterFlattened = [];
    let tempFilterList = [];
    Object.entries(filterList).map(filter => {
      if (filter[1] !== null && filter[1] !== ""){
        if (filterFlattened.length < 1) {
          filterFlattened.push(filter[1])
        } else {
          filterFlattened[0].map((filtered_id, index)=> {
            if(!filter[1].includes(filtered_id)) {
              if (!tempFilterList.includes(index)) {
                tempFilterList.push(index)
              }
            }
          })
        }
      }
    })
    tempFilterList.map(index => {
      filterFlattened[0][index] = ""
    })
    let tempKeyList = []
    if (filterFlattened.length > 0){
      filterFlattened[0].map(key_id=> {
        if (key_id !== ""){
          trueKeyList.map(key => {
            if (key._id === key_id) {
              tempKeyList.push(key)
            }
          })
        }
      })
      return tempKeyList
    } else {
      return(trueKeyList)
    }
    
}

function Filter(props) { 
  let filters = props.children.filterVars;
  const trueKeyList = props.children.trueKeyList;
  const resetFilters = () => {
    Object.keys(filters).map(name => {
      filters[name] = ""
    })
    props.children.setFilterVars(filters);
    props.children.setKeyList(trueKeyList);
  }
  const filtering = (value, name) => {    
    filters[name] = value
    props.children.setFilterVars(filters);
    props.children.setKeyList(updateFilter(filters, trueKeyList))
  }
  const handleChange = e => {
    const { target : {value, name} } = e
    filtering(value, name);
  }
  // next step is to connect in a keyList state function to update the current list with 
  return (
    <>  
      <Row>
        <Col>
          <InputGroup>
            <FormControl name="typeFilter" value={filters.typeFilter} onChange={handleChange}/>
        </InputGroup>
        </Col>
        <Col>
          <InputGroup>
            <FormControl name="numberFilter" value={filters.numberFilter} onChange={handleChange}/>
          </InputGroup>
        </Col>
        <Col>
          <InputGroup>
            <FormControl name="ownerFilter" value={filters.ownerFilter} onChange={handleChange}/>
          </InputGroup>
        </Col>
        <Col>
          <InputGroup>
            <FormControl name="issueDateFilter" value={filters.issueDateFilter} onChange={handleChange}/>
          </InputGroup>
        </Col>
        <Col>
          <InputGroup>
            <FormControl name="returnDateFilter" value={filters.returnDateFilter} onChange={handleChange}/>
          </InputGroup>
        </Col>
        <Col>
        <Button block onClick={resetFilters} >reset</Button>
        </Col>
      </Row>
      
    </>
  )
}
function Login(props) {
  const [passphrase, setPassphrase] = useState([""]);
  const handleChange = e => {
    e.preventDefault()
    const {target: {value}} = e
    setPassphrase(value)
  }
  const enterSubmit = e => {
    if (e.charCode === 13) {
      handleClick()
    }
  }
  const handleClick = async () => {
    const hash = crypto.createHash('sha256');
    hash.update(passphrase)
    const loginRes = await login(hash.digest("hex"))
    // login function contains user info which can be brought in to allow the implementation of user based adjustment
    if (loginRes) {
      props.children.setIsLoggedIn(true)
    }
  }
  return (
    <Container >
      <Row >
        <Col className="align-center" >
          <InputGroup>
            <FormControl name="passphrase" value={passphrase} onChange={handleChange} placeholder={"passphrase"} onKeyPress={enterSubmit}/>
            <InputGroup.Append>
              <Button onClick={() => handleClick()}>Login</Button>
            </InputGroup.Append>
          </InputGroup>
        </Col>
      </Row>
    </Container>
  )
}


function App() {

  const loginSet = false;

  const [isLoggedIn, setIsLoggedIn] = useState(false)
 
  const [trueKeyList, setTrueKeyList] = useState([])
  const [keyList, setKeyList] = useState([])
  const [keyTypes, setKeyTypes] = useState([])
  const [keysLoaded, setKeysLoaded] = useState(false)
  const [keysLoading, setKeysLoading] = useState(false)
  const date = new Date().toDateString()
  // used to get the keyList from mongo

  // Check that you can't access this data outside the lock screen. Shouldn't run till logged in
  useEffect(async () => {
    // console.log(keyList)
    if (!loginSet || isLoggedIn){
      if (!keysLoaded && !keysLoading) {
        setKeysLoading(true)
        const result = await getKeys();
        const keyTypes = await getKeyTypes();
        setKeyTypes(keyTypes)
        setKeyList(result)
        setTrueKeyList(result)
        setKeysLoaded(true)
      }
    }
  })
  
  const [addModalShow, setAddModalShow] = useState(false)
  const [adminModalShow, setAdminModalShow] = useState(false)
  const [issueModalShow, setIssueModalShow] = useState(false)
  const [issueModalIndex, setIssueModalIndex] = useState(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filterVars, setFilterVars] = useState({
    typeFilter:"",
    numberFilter:"",
    ownerFilter:"",
    issueDateFilter:"",
    returnDateFilter:"",
  })
  const updateTrueKeyList = (_idToUpdate, updateType, props) => {
    let tempKeyList = [...trueKeyList];
    switch (updateType) {
      case "add":
        tempKeyList.push(props)
        break;
      default:
        tempKeyList.map(key => {
          if (key._id === _idToUpdate) {
            switch(updateType) {
              case "return":
                key.owner = "";
                key.returnDate = date;
                break;
              case "issue":
                key.owner = props;
                key.issueDate = date;
                key.returnDate = "";
                break;
              case "update":
                key.type = props.type;
                key.owner = props.owner;
                key.issueDate = props.issueDate;
                key.number = props.number
                break
            }
          }
        });
        break
    }
    setTrueKeyList(tempKeyList)
    return(tempKeyList)
  }
  const archiveKey = key => {
    const prepKey = {
      key_id: key._id,
      owner: key.owner,
      issueDate: key.issueDate,
      returnDate: date
    }
    archiveDbUpdate(prepKey)
  }
  const addKey = (props) => {
    const trueKeyList = updateTrueKeyList(null, "add", props)
    setKeyList(updateFilter(filterVars, trueKeyList))
    // keyDbUpdate(props)
    const functions = {
      updateTrueKeyList: updateTrueKeyList,
      setTrueKeyList: setTrueKeyList,
      updateFilter: updateFilter,
      filterVars: filterVars,
      setKeyList: setKeyList,
    }
    keyDbUpdate(props, functions)
  }
  const returnKey  = index => {
    let returnKeyList = [...keyList]
    archiveKey(returnKeyList[index])
    const _idToUpdate = returnKeyList[index]._id
    const trueKeyList = updateTrueKeyList(_idToUpdate, "return");       
    setKeyList(updateFilter(filterVars, trueKeyList));
    returnDbUpdate(_idToUpdate)
    
  }
  const issueKey = props => {
    let issueKeyList = [...keyList];
    const _idToUpdate = issueKeyList[props.issueModalIndex]._id;
    issueKeyList[props.issueModalIndex].owner = props.newOwner;
    issueKeyList[props.issueModalIndex].issueDate = new Date().toDateString()
    issueKeyList[props.issueModalIndex].returnDate = ""
    issueDbUpdate(issueKeyList[props.issueModalIndex])
    const trueKeyList = updateTrueKeyList(_idToUpdate, "issue", props.newOwner) // updates keyList...
    setKeyList(updateFilter(filterVars, trueKeyList))
    setIssueModalShow(false)
  }
  const toggleFilter = () => {
    if (showFilter) {
      setShowFilter(false)
    } else {
      setShowFilter(true)
    }
  }
  if (!isLoggedIn && loginSet){
    return (
      <Login
        children={{
          setIsLoggedIn: () => setIsLoggedIn(true)
        }}
      />
    )
    
  } else {
    return (
      <Container fluid >
        <div className="sticky-top" style={{"backgroundColor":"white"}}>
          <Row >
            <Col>
              <Button size="lg" variant="success" block onClick={() => setAddModalShow(true)}>Add Key</Button>
            </Col>
            <Col>
            <Button size="lg" block onClick={toggleFilter} variant="primary">Search</Button>
            </Col>
            <Col sm={"3"} lg="2">
              <Button size = "lg" block onClick={() => setAdminModalShow(true)} variant="dark" >Admin</Button>
            </Col>
          </Row>
          {showFilter && keysLoaded && <Filter
              children={{
                keyList: keyList,
                trueKeyList: trueKeyList,
                setKeyList: filteredList => setKeyList(filteredList),
                filterVars: filterVars,
                setFilterVars: newFilter => setFilterVars(newFilter),
              }}
            />}
          <Row>
            <Col>Key Type</Col>
            <Col>Key #</Col>
            <Col>Issued To</Col>
            <Col>Issue Date</Col>
            <Col>Return Date</Col>
            <Col></Col>
          </Row>
          <br/>
        </div>
        {keysLoaded &&
          <>
            <ListKeys
              children={{
                keyList:keyList,
                setKeyList: updatedKeyList => setKeyList(updatedKeyList),
                updateTrueKeyList: (_idToUpdate, updateType, props) => updateTrueKeyList(_idToUpdate, updateType, props),
                returnFunc: index => returnKey(index),
                issueModal: () => setIssueModalShow(true),
                keyIndex: index => setIssueModalIndex(index),
              }}
            />
            <IssueModal 
              show={issueModalShow}
              onHide={() => setIssueModalShow(false)}
              children={{
                keyList: keyList,
                issueFunc: props => issueKey(props),
                issueModalIndex: issueModalIndex
              }}
            />
            <AddModal
              show={addModalShow}
              onHide={() => setAddModalShow(false)}
              children={{
                  keyList: trueKeyList,
                  newKey:newKey => addKey(newKey),
                  keyTypes: keyTypes
              }}
            />
            <AdminModal
              show={adminModalShow}
              onHide={() => setAdminModalShow(false)}
              children={{
                keyTypes: keyTypes,
                setKeyTypes: updatedKeyTypes => setKeyTypes(updatedKeyTypes)
              }}
            />
          </>
        }
      </Container>  
    );
  }
}
  

export default App;
