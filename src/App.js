import './App.css';
import {Container, Row, Col, Button, Modal, InputGroup, FormControl, DropdownButton, Dropdown, Spinner} from 'react-bootstrap'
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';



async function getKeys() {
  return fetch("http://localhost:3001/keys", {
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

async function issueDbUpdate(props) {
  const toUpdate = {
    _id: props._id,
    newOwner: props.owner
  }
  return fetch("http://localhost:3001/issueKey", {
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
  return fetch("http://localhost:3001/returnKey", {
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

async function keyDbUpdate(props) {
  const body = {
    number: props.number,
    type: props.type,
    owner: props.owner,
    issueDate: props.issueDate,
    returnDate: props.returnDate,
  }
  fetch("http://localhost:3001/addKey", {
    method: "POST",
    body: "toAdd=" + JSON.stringify(body),
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
function AddModal(props) {
  const [checkDisabled, setCheckDisabled] = useState(false) 
  const [newKeyNumber, setNewKeyNumber] = useState(props.children.keyList.length + 1)
  const [newKeyType, setNewKeyType] = useState("A")
  const [newKeyOwner, setNewKeyOwner] = useState(null)
  const [typeOther, setTypeOther] = useState(false)
  function resetModal() {
    setCheckDisabled(false)
    setNewKeyNumber(props.children.keyList.length + 1)
    setNewKeyType("A")
    setNewKeyOwner(null)
    setTypeOther(false)
  }
  function handleChange(e) {
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
        console.log(value)
    }
    
  }
  function enterSubmit(e) {
    console.log(e.charCode)
    if (e.charCode === 13) {
      prepKey()
    }
  }
  function prepKey() {
    let newKey = {
      number: newKeyNumber,
      type: newKeyType,
      owner: newKeyOwner,
      issueDate: null,
      returnDate: null
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

  function handleChange(e) {
    const { target : {value, name} } = e
    setNewOwner(value)
    if (value !== "" && value != null) {
      setCheckDisabled(false)
    } else {
      setCheckDisabled(true)
    }

  }
  function resetModal(){
    setNewOwner(null);
    setCheckDisabled(true);
  }
  function submitIssue() {
    if (newOwner !== null && newOwner !== ""){
      props.children.issueFunc({newOwner,issueModalIndex})
      resetModal()
    }
  }
  function enterSubmit(e) {
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

function KeyFormat(key, index, functions) {
  function onClickHandler() {
    functions.keyIndex(index)
    functions.issueModal(index)
  }
  return (
    <Row key={index}>
      <Col>{key.type}</Col>
      <Col>{key.number}</Col>
      <Col>{key.owner}</Col>
      <Col>{key.issueDate}</Col>
      <Col>{key.returnDate}</Col>
      <Col>
        {key.owner !== null &&
          <Button onClick={() => functions.returnFunc(index)}>Return</Button>
        }
        {key.owner === null &&
          <Button onClick={onClickHandler}>Issue Key</Button>
        }

      </Col>
    </Row>
  )
}

function ListKeys(props) {
  var keyOutput;
  let functions = {
    returnFunc: props.children.returnFunc,
    issueModal: props.children.issueModal,
    keyIndex: props.children.keyIndex,
  }
  keyOutput = props.keyList.map(((key, index) =>
    KeyFormat(key, index, functions)
  ))
  return(
    keyOutput
  )
}

function App() {
  const [keyList, setKeyList] = useState([])
  // used to get the keyList from mongo
  useEffect(async () => {
    if (keyList.length === 0) {
      const result = await getKeys();
      setKeyList(result)
    }
  })
  const [addModalShow, setAddModalShow] = useState(false)
  const [issueModalShow, setIssueModalShow] = useState(false)
  const [issueModalIndex, setIssueModalIndex] = useState(null)
  var tempKeyList
  function addKey(props) {
    tempKeyList = keyList;
    tempKeyList.push(props)
    setKeyList(tempKeyList)
    keyDbUpdate(props)
  }
  function returnKey(index) {
    // setKeyList({...keyList, index  : {keyOwner: null}})
    tempKeyList = [...keyList];
    tempKeyList[index].owner = null
    tempKeyList[index].returnDate = new Date().toDateString()
    returnDbUpdate(tempKeyList[index]._id)
    setKeyList(tempKeyList)
  }
  function issueKey(index) {
    console.log(index)
    tempKeyList = [...keyList];
    tempKeyList[index.issueModalIndex].owner = index.newOwner;
    tempKeyList[index.issueModalIndex].issueDate = new Date().toDateString()
    // let toUpdate = tempKeyList[index.issueModalIndex];
    issueDbUpdate(tempKeyList[index.issueModalIndex])
    setKeyList(tempKeyList)
    setIssueModalShow(false)
  }
  return (
    <Container fluid >
      <Row >
        <Col>
          <Button size="lg" block onClick={() => setAddModalShow(true)}>Add</Button>
        </Col>
      </Row>
      <Row>
        {/* <Button variant="secondary" block size='sm'>Filter</Button> */}
      </Row>
      <Row>
        <Col>Key Type</Col>
        <Col>Key #</Col>
        <Col>Issued To</Col>
        <Col>Issue Date</Col>
        <Col>Return Date</Col>
        <Col></Col>
      </Row>
      {keyList.length > 0 &&
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
          <AddModal
            show={addModalShow}
            onHide={() => setAddModalShow(false)}
            children={
              {
                keyList: keyList,
                newKey:newKey => addKey(newKey)
            }
            }
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
        </>
      }
      

    </Container>  
  );
}

export default App;
