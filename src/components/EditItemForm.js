// src/components/EditItemForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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

function EditItemForm({ collection, setCollection }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [enhancementInput, setEnhancementInput] = useState({ name: '', points: 0 });

  useEffect(() => {
    const editItem = collection.find(i => i.id === parseInt(id));
    if (editItem) {
      setItem({ ...editItem, enhancements: Array.isArray(editItem.enhancements) ? editItem.enhancements : [] });
    } else {
      navigate('/');
    }
  }, [id, collection, navigate]);

  const addEnhancement = () => {
    if (enhancementInput.name) {
      setItem(prev => ({ ...prev, enhancements: [...prev.enhancements, enhancementInput] }));
      setEnhancementInput({ name: '', points: 0 });
    }
  };

  const removeEnhancement = (index) => {
    setItem(prev => ({ ...prev, enhancements: prev.enhancements.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCollection(collection.map(i => i.id === item.id ? item : i));
    navigate('/');
  };

  if (!item) return <div>Loading...</div>;

  return (
    <Container className="mt-4">
      <Card className="shadow-lg rounded">
        <Card.Header className="bg-success text-white"><h3>Edit Item</h3></Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor='name'>Name</Form.Label>
              <Form.Control id="name" type="text" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="faction-select">Faction</Form.Label>
              <Form.Select id="faction-select" value={item.faction} onChange={(e) => setItem({ ...item, faction: e.target.value })} required>
                {factions.map(f => <option key={f} value={f}>{f}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Base Points</Form.Label>
              <Form.Control type="number" value={item.basePoints} onChange={(e) => setItem({ ...item, basePoints: parseInt(e.target.value) || 0 })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Painted" checked={item.painted} onChange={(e) => setItem({ ...item, painted: e.target.checked })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" value={item.notes} onChange={(e) => setItem({ ...item, notes: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Enhancements</Form.Label>
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
                {item.enhancements.map((enh, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between">
                    {enh.name} ({enh.points} pts)
                    <Button variant="link" onClick={() => removeEnhancement(index)}>Remove</Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Button type="submit" variant="success">Save Changes</Button>
              <Link to="/" className="btn btn-outline-secondary">Cancel</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditItemForm;