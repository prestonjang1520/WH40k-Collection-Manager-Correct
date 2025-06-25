// src/components/ArmyBuilder.jsx
import React, { useState } from 'react';
import { Container, Card, Button, Row, Col, ListGroup, Form, Toast } from 'react-bootstrap';

function ArmyBuilder({ collection, armyList, setArmyList }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const addToArmy = (item) => {
    setArmyList(prev => [...prev, { ...item, modelCount: 1, selectedEnhancements: [] }]);
    setToastMessage(`${item.name} added to army!`);
    setShowToast(true);
  };

  const updateUnit = (index, field, value) => {
    setArmyList(prev => prev.map((unit, i) => i === index ? { ...unit, [field]: value } : unit));
  };

  const toggleEnhancement = (index, enhName) => {
    setArmyList(prev => prev.map((unit, i) => {
      if (i !== index) return unit;
      const selected = unit.selectedEnhancements.includes(enhName)
        ? unit.selectedEnhancements.filter(name => name !== enhName)
        : [...unit.selectedEnhancements, enhName];
      return { ...unit, selectedEnhancements: selected };
    }));
  };

  const calculatePoints = (unit) => {
    const enhancementPoints = unit.enhancements
      .filter(enh => unit.selectedEnhancements.includes(enh.name))
      .reduce((sum, enh) => sum + enh.points, 0);
    return (unit.basePoints * unit.modelCount) + enhancementPoints;
  };

  const removeFromArmy = (index) => {
    setArmyList(prev => prev.filter((_, i) => i !== index));
  };

  const downloadList = () => {
    const text = armyList.map(unit => {
      const selectedEnh = unit.selectedEnhancements.join(', ') || 'None';
      return `${unit.name} (${unit.faction}) - Models: ${unit.modelCount}, Enhancements: ${selectedEnh}, Points: ${calculatePoints(unit)}`;
    }).join('\n');
    const blob = new Blob([`Army List:\n\n${text}\n\nTotal Points: ${armyList.reduce((sum, unit) => sum + calculatePoints(unit), 0)}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'army-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-lg rounded">
        <Card.Header className="bg-info text-white d-flex justify-content-between">
          <h3>Army Builder</h3>
          <Button variant="primary" onClick={downloadList} disabled={!armyList.length}>Download List</Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h4>Available Units</h4>
              <ListGroup>
                {collection.map(item => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                    {item.name} ({item.faction})
                    <Button variant="outline-success" size="sm" onClick={() => addToArmy(item)}>Add to Army</Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <Col md={6}>
              <h4>Your Army</h4>
              {armyList.length === 0 ? (
                <p className="text-muted">Add units from the left to build your army.</p>
              ) : (
                <ListGroup>
                  {armyList.map((unit, index) => (
                    <ListGroup.Item key={index} className="mb-3 border rounded p-3 shadow-sm">
                      <h5>{unit.name} - Points: {calculatePoints(unit)}</h5>
                      <Form.Group controlId={`model-count-${index}`}>
                        <Form.Label>Model Count</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          value={unit.modelCount}
                          onChange={(e) => updateUnit(index, 'modelCount', parseInt(e.target.value) || 1)}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Enhancements</Form.Label>
                        {unit.enhancements.length === 0 ? (
                          <p>No enhancements available.</p>
                        ) : (
                          unit.enhancements.map(enh => {
                            const id = `enh-${index}-${enh.name.replace(/\s+/g, '-')}`;
                            return (
                              <Form.Check
                                key={enh.name}
                                type="checkbox"
                                id={id}  // Add this line
                                label={`${enh.name} (${enh.points} pts)`}
                                checked={unit.selectedEnhancements.includes(enh.name)}
                                onChange={() => toggleEnhancement(index, enh.name)}
                              />
                            );
                          })
                        )}
                      </Form.Group>
                      <Button variant="outline-danger" size="sm" onClick={() => removeFromArmy(index)}>Remove</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide position="top-end" className="position-fixed m-3">
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </Container>
  );
}

export default ArmyBuilder;