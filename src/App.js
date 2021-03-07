import './App.css';
import {Container, Row, Col, Button, Modal, InputGroup, FormControl, DropdownButton, Dropdown, Spinner} from 'react-bootstrap'
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
const crypto = require('crypto');

const url = "http://192.168.2.5:3001/" 



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
  console.log(toUpdate)
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
  const body = {
    number: props.number,
    type: props.type,
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
    // body._id = response.key_id;
    // const trueKeyList = functions.updateTrueKeyList(null, "add", body)
    // functions.setTrueKeyList(trueKeyList);
    // console.log(trueKeyList)

    // const updatedFilter = functions.updateFilter(functions.filterVars, trueKeyList)
    // console.log(updateFilter)
    // functions.setKeyList(updateFilter)
    
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

function AddModal(props) {
  const [checkDisabled, setCheckDisabled] = useState(false) 
  const [newKeyNumber, setNewKeyNumber] = useState(props.children.keyList.length + 1)
  const [newKeyType, setNewKeyType] = useState("A")
  const [newKeyOwner, setNewKeyOwner] = useState("")
  const [typeOther, setTypeOther] = useState(false)
  const resetModal = () => {
    setCheckDisabled(false)
    setNewKeyNumber(props.children.keyList.length + 1)
    setNewKeyType("A")
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
          <Col>Issueed To</Col>
        </Row>
        <Row>
          {!typeOther &&
            <Col className="justify-content-md-center">
              <DropdownButton title={newKeyType}>
                <Dropdown.Item name="type" onClick={() => setNewKeyType("A")}>A</Dropdown.Item>
                <Dropdown.Item name="type" onClick={() => setNewKeyType("B")}>B</Dropdown.Item>
                <Dropdown.Item name="type" onClick={() => setNewKeyType("C")}>C</Dropdown.Item>
                <Dropdown.Item name="type" onClick={() => setNewKeyType("D")}>D</Dropdown.Item>
                <Dropdown.Item name="type" onClick={() => setNewKeyType("E")}>E</Dropdown.Item>
                <Dropdown.Item onClick={() => setTypeOther(true)}>Other</Dropdown.Item>
              </DropdownButton>
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
              <FormControl placeholder="Leave blank if not issueed out" name="owner" onChange={handleChange} aria-label="Issueed to " onKeyPress={enterSubmit}/>
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
  const key = props.children.key
  const hrStyle = {
   "backgroundColor": "black",
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
          Key: {key.number}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            Key Type: {key.type}
          </Col>
          <Col>
            Issued To: {key.owner}
          </Col>
        </Row>
        <Row>
          <Col>
          </Col>
          <Col>
            Issue Date: {key.issueDate}
          </Col>
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
            key: key
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
                <Button block variant="success" onClick={() => functions.returnFunc(index)}>Return</Button>
              }
              {key.owner === "" && key.owner !== null &&
                <Button block   onClick={onClickHandler}>Issue Key</Button>
              }
            
        </Col>
      </Row>
      <Row>
        <Col>
            {/* <Button block variant="outline-info" >details</Button> */}
            <Button block variant="outline-info" onClick={() => keyModal(index)}>details</Button>

          </Col>
      </Row>
    </div>
  )
}

function ListKeys(props) {
  var keyOutput;
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [modalKey, setModalKey]= useState({})
  const functions = {
    returnFunc: props.children.returnFunc,
    issueModal: props.children.issueModal,
    keyIndex: props.children.keyIndex,
  }
  const keyModal = (index) => {
    setModalKey(props.keyList[index])
    setShowKeyModal(true)
  }
  keyOutput = props.keyList.map(((key, index) =>
    KeyFormat(key, index, functions, keyModal)
  ))
  return(
    <>
    <KeyModal
        show={showKeyModal}
        onHide={() => setShowKeyModal(false)}
        children = {{
          key: modalKey,
        }}
      />
    {keyOutput}
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
    console.log(trueKeyList)
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
        setKeyList(result)
        setTrueKeyList(result)
        setKeysLoaded(true)
      }
    }
  })
  
  const [addModalShow, setAddModalShow] = useState(false)
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
                break;
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
    keyDbUpdate(props)
    // const functions = {
    //   updateTrueKeyList: updateTrueKeyList,
    //   setTrueKeyList: setTrueKeyList,
    //   updateFilter: updateFilter,
    //   filterVars: filterVars,
    //   setKeyList: setKeyList,
    // }
    // keyDbUpdate(props, functions)
    // // const trueKeyList =
    // setKeyList(updateFilter(filterVars, trueKeyList))
    // setKeyList(keyDbUpdate(props))
  }
  const returnKey  = index => {
    let returnKeyList = [...keyList]
    console.log(returnKeyList)
    archiveKey(returnKeyList[index])
    const _idToUpdate = returnKeyList[index]._id
    const trueKeyList = updateTrueKeyList(_idToUpdate, "return");
    console.log(returnKeyList[index])          
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
        <Row >
          <Col>
            <Button size="lg" block onClick={() => setAddModalShow(true)}>Add</Button>
          </Col>
        </Row>
        <Row>
          <Button onClick={toggleFilter} variant="secondary" block size='sm'>Filter</Button>
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
        {keysLoaded &&
          <>
            <ListKeys
              keyList={keyList}
              setKeyList={setKeyList}
              children={{
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
                  newKey:newKey => addKey(newKey)
              }}
            />
          </>
        }
      </Container>  
    );
  }
}
  

export default App;
