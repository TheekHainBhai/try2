import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Grid,
  Rating,
  TextField,
  Card,
  CardContent,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const ProductReviews = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');

  const reviews = [
    {
      id: 1,
      productName: 'Organic Wheat Flour',
      user: 'John D.',
      rating: 4,
      date: '2025-04-08',
      comment: 'Excellent quality, meets all safety standards.',
      category: 'Groceries',
      verified: true,
    },
    {
      id: 2,
      productName: 'Fresh Milk',
      user: 'Sarah M.',
      rating: 5,
      date: '2025-04-07',
      comment: 'Consistently good quality and proper packaging.',
      category: 'Dairy',
      verified: true,
    },
    {
      id: 3,
      productName: 'Chicken Breast',
      user: 'Mike R.',
      rating: 3,
      date: '2025-04-06',
      comment: 'Quality is okay, but packaging could be improved.',
      category: 'Meat',
      verified: true,
    },
  ];

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <Grid container spacing={0} sx={{ mt: 10, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Product Reviews</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
        >
          Write Review
        </Button>
      </Box>

      <Grid container spacing={3}>
        {reviews.map((review) => (
          <Grid item xs={12} key={review.id}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Avatar>{review.user[0]}</Avatar>
                      <Box>
                        <Typography variant="h6">{review.productName}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          by {review.user} • {review.date}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Rating value={review.rating} readOnly />
                      <Chip
                        label={review.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {review.verified && (
                        <Chip
                          label="Verified Purchase"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="body1">{review.comment}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Review Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Product Name"
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="Groceries">Groceries</MenuItem>
                <MenuItem value="Dairy">Dairy</MenuItem>
                <MenuItem value="Meat">Meat</MenuItem>
                <MenuItem value="Beverages">Beverages</MenuItem>
                <MenuItem value="Snacks">Snacks</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ my: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
              />
            </Box>
            <TextField
              fullWidth
              label="Review"
              multiline
              rows={4}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ProductReviews;
