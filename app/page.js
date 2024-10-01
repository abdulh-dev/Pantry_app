'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { getFirestore, collection, query, getDocs, doc, setDoc, getDoc, deleteDoc } from "@firebase/firestore";
import { Box, Button, Modal, Stack, TextField, Typography, Card, CardContent, AppBar, Toolbar } from "@mui/material";
import { firestore } from "@/firebase";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1); 
  const [searchQuery, setSearchQuery] = useState('');

  const updateInventory = async () => {
    const db = getFirestore();
    const snapshot = query(collection(db, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
    console.log(inventoryList);
  };

  const addItem = async (item, quantity) => { 
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: currentQuantity + quantity });
    } else {
      await setDoc(docRef, { quantity });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const deleteItemSlot = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredInventory(inventory);
    } else {
      setFilteredInventory(inventory.filter(item => item.name.toLowerCase().includes(query.toLowerCase())));
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName(''); 
    setQuantity(1); 
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={4} bgcolor="#1A202C" minHeight="100vh"> {/* Dark Blue Background */}
      <AppBar position="static" sx={{ bgcolor: '#1A202C' }}> {/* Dark Blue AppBar */}
        <Toolbar>
          <Typography variant="h6" sx={{ color: 'grey' }}>Inventory Management</Typography>
        </Toolbar>
      </AppBar>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mt: 4 }}>
        Add New Item
      </Button>
      <TextField
        variant="outlined"
        placeholder="Search items"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        sx={{ mt: 2, width: '80%', bgcolor: 'grey', input: { color: 'white' }, '& .MuiOutlinedInput-root': { borderColor: 'white' } }}
      />
      <Modal open={open} onClose={handleClose}>
        <Box position="absolute"
          top="50%"
          left="50%"
          width={500}
          bgcolor="grey"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography variant="h6" sx={{ color: 'white' }}>Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item Name"
              sx={{ bgcolor: 'white', input: { color: 'black' } }}
            />
            <TextField
              variant="outlined"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              placeholder="Quantity"
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ bgcolor: 'white', input: { color: 'black' } }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName, quantity);
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box width="80%" mt={4}>
        <Card sx={{ bgcolor: 'grey' }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom sx={{ color: 'white' }}>
              Inventory Items
            </Typography>
            {filteredInventory.length === 0 && (
              <Typography variant="body2" color="white">
                No items in inventory
              </Typography>
            )}
            {filteredInventory.map((item) => (
              <Box key={item.name} display="flex" justifyContent="space-between" alignItems="center" p={2} bgcolor="#4f4f4f" mb={2} borderRadius={2}>
                <Typography variant="body1" sx={{ color: 'white' }}>{item.name}</Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>{item.quantity}</Typography>
                <Box display="flex" gap={1}>
                  <Button variant="contained" color="secondary" onClick={() => removeItem(item.name)}>
                    Remove
                  </Button>
                  <Button variant="contained" color="error" onClick={() => deleteItemSlot(item.name)}>
                    Delete
                  </Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
