// src/components/AddItemForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, ListGroup } from 'react-bootstrap';

const factions = [
  'Adepta Sororitas', 'Adeptus Custodes', 'Adeptus Mechanicus', 'Astra Militarum', 'Imperial Knights',
  'Space Marines', 'Blood Angels', 'Dark Angels', 'Deathwatch', 'Grey Knights', 'Space Wolves',
  'Black Templars', 'Ultramarines', 'White Scars', 'Raven Guard', 'Salamanders', 'Iron Hands',
  'Chaos Daemons', 'Chaos Knights', 'Chaos Space Marines', 'Death Guard', 'Thousand Sons', 'World Eaters',
  'Craftworlds', 'Drukhari', 'Harlequins', 'Ynnari', 'Necrons', 'Orks', "T'au Empire",
  'Genestealer Cults', 'Tyranids', 'Leagues of Votann', 'Inquisition', 'Agents of the Imperium',
  'Officio Assassinorum', 'Other'
];

function AddItemForm({ setCollection }) {
  const [newItem, setNewItem] = useState({ name: '', faction: factions[0], basePoints: 0, painted: false, notes: '', enhancements: [] });
  const [enhancementInput, setEnhancementInput] = useState({ name: '', points: 0 });
  const navigate = useNavigate();

  const addEnhancement = () => {
    if (enhancementInput.name) {
      setNewItem(prev => ({ ...prev, enhancements: [...prev.enhancements, enhancementInput] }));
      setEnhancementInput({ name: '', points: 0 });
    }
  };

  const removeEnhancement = (index) => {
    setNewItem(prev => ({ ...prev, enhancements: prev.enhancements.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemWithId = { ...newItem, id: Date.now() };
    setCollection(prev => [...prev, itemWithId]);
    navigate('/');
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-lg rounded">
        <Card.Header className="bg-success text-white"><h3>Add New Item</h3></Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor='name'>Name</Form.Label>
              <Form.Control id="name" type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="faction-select">Faction</Form.Label>
              <Form.Select id="faction-select" value={newItem.faction} onChange={(e) => setNewItem({ ...newItem, faction: e.target.value })} required>
                {factions.map(f => <option key={f} value={f}>{f}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor='points'>Base Points</Form.Label>
              <Form.Control id="points" type="number" value={newItem.basePoints} onChange={(e) => setNewItem({ ...newItem, basePoints: parseInt(e.target.value) || 0 })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check id="painted-checkbox" type="checkbox" label="Painted" checked={newItem.painted} onChange={(e) => setNewItem({ ...newItem, painted: e.target.checked })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor='notes'>Notes</Form.Label>
              <Form.Control as="textarea" id='notes' value={newItem.notes} onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Enhancements (Add custom enhancements for this item)</Form.Label>
              <Row className="mb-2">
                <Col>
                  <Form.Control type="text" placeholder="Enhancement Name" value={enhancementInput.name} onChange={(e) => setEnhancementInput({ ...enhancementInput, name: e.target.value })} />
                </Col>
                <Col>
                  <Form.Control type="number" placeholder="Points" value={enhancementInput.points} onChange={(e) => setEnhancementInput({ ...enhancementInput, points: parseInt(e.target.value) || 0 })} />
                </Col>
                <Col xs="auto">
                  <Button variant="outline-secondary" onClick={addEnhancement}>Add</Button>
                </Col>
              </Row>
              <ListGroup variant="flush">
                {newItem.enhancements.map((enh, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between">
                    {enh.name} ({enh.points} pts)
                    <Button variant="link" onClick={() => removeEnhancement(index)}>Remove</Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Button type="submit" variant="success">Add Item</Button>
              <Link to="/" className="btn btn-outline-secondary">Cancel</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddItemForm;