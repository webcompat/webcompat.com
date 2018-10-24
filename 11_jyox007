import pandas as pd
#loading the datasdet using pandas dataframe
school_dataset = pd.read_csv('Somerville_High_School_YRBS_Raw_Data_2002-2016.csv', na_values=' ')
#filling NA values
school_dataset.fillna("No data available", inplace = True )
#Here parents is a categorical column, it has got few categories, to seperate each category and to make distributions we need to do one hot encoding
#doing one hot encoding using get_dummies from pandas
one_hot = pd.get_dummies(school_dataset["parents"]) #This will be the dataframe of each single caregiver type
#joining both the dataframe to create single dataframe distribution
school_dataset = school_dataset.join(one_hot)
#Here is the dataset with single caregiver type distribution school_dataset

#As the definitation of distrubtion is not clear here, I am also computing the total frequency of each single caregiver type

#To find unique values in parents column
school_dataset["parents"].unique()
#Now we will search for the distribution of each unique values
# We will find here the columns which contains this particular string
a= "mother"
print("Number of samples with mother", len(school_dataset[school_dataset["parents"].str.contains(a)]))
a="father"
print("Number of samples with father",len(school_dataset[school_dataset["parents"].str.contains(a)]))
a="step-parent"
print("Number of samples with step-parent",len(school_dataset[school_dataset["parents"].str.contains(a)]))
a="Foster parent"
print("Number of samples with Foster parent",len(school_dataset[school_dataset["parents"].str.contains(a)]))
a="Another relative"
print("Number of samples with Another relative",len(school_dataset[school_dataset["parents"].str.contains(a)]))
a="Someone else not on this list"
print("Number of samples with Someone else not on this list",len(school_dataset[school_dataset["parents"].str.contains(a)]))
a="No data available"
print("Number of samples with No Data Available",len(school_dataset[school_dataset["parents"].str.contains(a)]))
#As we can sae the sum of all these values is more than the total number of rows in this dataset, it is because there is overlapping in all these values. 

