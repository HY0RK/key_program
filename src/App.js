import './App.css';
import {Container, Row, Col, Button, Modal, InputGroup, FormControl, DropdownButton, Dropdown} from 'react-bootstrap'
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function test() {
  fetch("http://localhost:3001/keys", {
    method: "GET",
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  }).then((response) => {
    console.log(response)
    if (response.ok) {
      return response.json();
    } else {
      console.log(response)
    }
  }).then((response) => {
    console.log(response)
  })
}


function getKeys() {
  return (
    [
      {
        number: 1,
        type: "B",
        owner: "Frank",
        issueDate: null,
        returnDate: null
      },{
        number: 2,
        type: "A",
        owner: null,
        issueDate: null,
        returnDate: null,
      }
    ]
    
  )
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
          setNewKeyNumber(parseInt(value))
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
          <Col>Key #</Col>
          <Col>Key Type</Col>
          <Col>Loaned To</Col>
        </Row>
        <Row>
          <Col>
            <InputGroup>
              <FormControl value={newKeyNumber} name="number" onChange={handleChange}  aria-label="With textarea" />
            </InputGroup>
          </Col>
          
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
              <FormControl placeholder="Leave blank if not loaned out" name="owner" onChange={handleChange} aria-label="Loaned to " onKeyPress={enterSubmit}/>
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



function LoanModal(props) {
  const [newOwner, setNewOwner] = useState(null)
  const [checkDisabled, setCheckDisabled] = useState(true)
  const loanModalIndex = props.children.loanModalIndex

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
  function submitLoan() {
    if (newOwner !== null && newOwner !== ""){
      props.children.loanFunc({newOwner,loanModalIndex})
      resetModal()
    }
  }
  function enterSubmit(e) {
    if (e.charCode === 13) {
      submitLoan()
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
          Loan Key
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
        <Button disabled={checkDisabled} onClick={submitLoan}>Add</Button>
      </Modal.Footer>
    </Modal>
  )
}

function KeyFormat(key, index, functions) {
  function onClickHandler() {
    functions.keyIndex(index)
    functions.loanModal(index)
  }
  return (
    <Row key={index}>
      <Col>{key.number}</Col>
      <Col>{key.type}</Col>
      <Col>{key.owner}</Col>
      <Col>{key.issueDate}</Col>
      <Col>{key.returnDate}</Col>
      <Col>
        {key.owner !== null &&
          <Button onClick={() => functions.returnFunc(index)}>Return</Button>
        }
        {key.owner === null &&
          <Button onClick={onClickHandler}>Loan Key</Button>
        }

      </Col>
    </Row>
  )
}

function ListKeys(props) {
  var keyOutput;
  let functions = {
    returnFunc: props.children.returnFunc,
    loanModal: props.children.loanModal,
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
  const [keyList, setKeyList] = useState(getKeys)
  const [addModalShow, setAddModalShow] = useState(false)
  const [loanModalShow, setLoanModalShow] = useState(false)
  const [loanModalIndex, setLoanModalIndex] = useState(null)
  var tempKeyList
  function addKey(props) {
    tempKeyList = keyList;
    tempKeyList.push(props)
    setKeyList(tempKeyList)
  }
  function returnKey(index) {
    // setKeyList({...keyList, index  : {keyOwner: null}})
    tempKeyList = [...keyList];
    tempKeyList[index].owner = null
    tempKeyList[index].returnDate = new Date().toDateString()
    setKeyList(tempKeyList)
  }
  function loanKey(index) {
    tempKeyList = [...keyList];

    tempKeyList[index.loanModalIndex].owner = index.newOwner;
    tempKeyList[index.loanModalIndex].issueDate = new Date().toDateString()
    setKeyList(tempKeyList)
    setLoanModalShow(false)
  }
  return (
    <Container fluid >
      <Row >
        <Col>
          <Button size="lg" block onClick={() => setAddModalShow(true)}>Add</Button>
        </Col>
      </Row>
      <Row>
        <Col>Key #</Col>
        <Col>Key Type</Col>
        <Col>Loaned To</Col>
        <Col>Issue Date</Col>
        <Col>Return Date</Col>
        <Col></Col>
      </Row>
      <ListKeys
        keyList={keyList}
        setKeyList={setKeyList}
        children={{
          returnFunc: index => returnKey(index),
          loanModal: () => setLoanModalShow(true),
          keyIndex: index => setLoanModalIndex(index),
        }}
      />
      <Button onClick={test}>TEST</Button>
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
      <LoanModal 
        show={loanModalShow}
        onHide={() => setLoanModalShow(false)}
        children={{
          keyList: keyList,
          loanFunc: props => loanKey(props),
          loanModalIndex: loanModalIndex
        }}
      />

    </Container>  
  );
}

export default App;
