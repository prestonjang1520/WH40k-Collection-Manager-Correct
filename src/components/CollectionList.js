// src/components/CollectionList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, ListGroup, Badge, Button, Form } from 'react-bootstrap';

// Convert collection array to CSV string
function collectionToCSV(collection) {
  if (collection.length === 0) return '';

  // CSV header
  const headers = ['id', 'name', 'faction', 'basePoints', 'painted', 'notes', 'enhancements'];
  const escapeCSV = (text) => `"${String(text).replace(/"/g, '""')}"`;

  const rows = collection.map(item => {
    // Serialize enhancements array as JSON string for simplicity
    const enhStr = JSON.stringify(item.enhancements || []);
    return [
      item.id,
      escapeCSV(item.name),
      escapeCSV(item.faction),
      item.basePoints,
      item.painted,
      escapeCSV(item.notes),
      escapeCSV(enhStr)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Parse CSV string to collection array
function csvToCollection(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const idx = (header) => headers.indexOf(header);

  const parseCSVField = (field) => {
    // Remove wrapping quotes and unescape quotes inside
    if (!field) return '';
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.slice(1, -1).replace(/""/g, '"');
    }
    return field;
  };

  return lines.slice(1).map(line => {
    // Split by commas respecting quoted fields
    // Simple regex split: better to use a CSV parser if complex data expected
    const regex = /("([^"]|"")*"|[^,]*)(,|$)/g;
    const fields = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match[1]) fields.push(parseCSVField(match[1]));
      if (match[3] === '') break; // end of line
    }

    return {
      id: Number(fields[idx('id')]) || Date.now(),
      name: fields[idx('name')] || '',
      faction: fields[idx('faction')] || '',
      basePoints: Number(fields[idx('basePoints')]) || 0,
      painted: fields[idx('painted')] === 'true',
      notes: fields[idx('notes')] || '',
      enhancements: (() => {
        try {
          return JSON.parse(fields[idx('enhancements')] || '[]');
        } catch {
          return [];
        }
      })()
    };
  });
}

function CollectionList({ collection, setCollection }) {
  const [search, setSearch] = useState('');

  const filtered = collection.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  const deleteItem = (id) => setCollection(collection.filter(item => item.id !== id));

  // CSV export
    const exportCSV = () => {
      const csv = collectionToCSV(collection);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wh40k-collection.csv';
      a.click();
      URL.revokeObjectURL(url);
    };
  
    // CSV import
    const importCSV = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = csvToCollection(e.target.result);
          setCollection(imported);
        } catch (err) {
          alert('Failed to import CSV: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
  
    return (
      <Container className="mt-4">
        <Card className="shadow-lg rounded">
          <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
            <h3 className="mb-0">Your Collection</h3>
            <div>
              <Link to="/add" className="btn btn-light me-2">Add New Item</Link>
              <Link to="/army-builder" className="btn btn-success me-2">Build Army</Link>
              <Button variant="outline-light" onClick={exportCSV} className="me-2">Export CSV</Button>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={importCSV}
                style={{ display: 'inline-block', width: 'auto' }}
              />
            </div>
          </Card.Header>
          <Card.Body>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {filtered.length === 0 ? (
              <p className="text-muted">No items found. Try adjusting your search or add new items.</p>
            ) : (
              <ListGroup variant="flush">
                {filtered.map(item => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center border-bottom py-3">
                    <div>
                      <h5>{item.name} ({item.faction})</h5>
                      <Badge bg={item.painted ? 'success' : 'secondary'} className="me-2">
                        {item.painted ? 'Painted' : 'Unpainted'}
                      </Badge>
                      <p>{item.notes}</p>
                    </div>
                    <div>
                      <Link to={`/edit/${item.id}`} className="btn btn-sm btn-outline-primary me-2">Edit</Link>
                      <Button variant="outline-danger" size="sm" onClick={() => deleteItem(item.id)}>Delete</Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Container>
    );
}

export default CollectionList;