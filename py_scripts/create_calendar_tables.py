import boto3
from botocore.exceptions import ClientError
import uuid
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

print("🗓️ Creating Calendar Tables...")

# ============================================
# 1. ASSIGNMENTS TABLE
# ============================================
try:
    assignments_table = dynamodb.create_table(
        TableName='Assignments',
        KeySchema=[
            {'AttributeName': 'assignment_id', 'KeyType': 'HASH'}
        ],
        AttributeDefinitions=[
            {'AttributeName': 'assignment_id', 'AttributeType': 'S'},
            {'AttributeName': 'course_id', 'AttributeType': 'S'},
            {'AttributeName': 'due_date', 'AttributeType': 'S'}
        ],
        GlobalSecondaryIndexes=[
            {
                'IndexName': 'course-index',
                'KeySchema': [{'AttributeName': 'course_id', 'KeyType': 'HASH'}],
                'Projection': {'ProjectionType': 'ALL'}
            },
            {
                'IndexName': 'due-date-index',
                'KeySchema': [{'AttributeName': 'due_date', 'KeyType': 'HASH'}],
                'Projection': {'ProjectionType': 'ALL'}
            }
        ],
        BillingMode='PAY_PER_REQUEST',
        StreamSpecification={
            'StreamEnabled': True,
            'StreamViewType': 'NEW_AND_OLD_IMAGES'
        }
    )
    assignments_table.wait_until_exists()
    print("✅ Created: Assignments (with DynamoDB Stream)")
except ClientError as e:
    print(f"❌ Error creating Assignments: {e}")

# ============================================
# 2. STUDENT_DEADLINES TABLE (for personalized view)
# ============================================
try:
    deadlines_table = dynamodb.create_table(
        TableName='StudentDeadlines',
        KeySchema=[
            {'AttributeName': 'student_id', 'KeyType': 'HASH'},
            {'AttributeName': 'deadline_date', 'KeyType': 'RANGE'}
        ],
        AttributeDefinitions=[
            {'AttributeName': 'student_id', 'AttributeType': 'S'},
            {'AttributeName': 'deadline_date', 'AttributeType': 'S'}
        ],
        BillingMode='PAY_PER_REQUEST',
        StreamSpecification={
            'StreamEnabled': True,
            'StreamViewType': 'NEW_AND_OLD_IMAGES'
        }
    )
    deadlines_table.wait_until_exists()
    print("✅ Created: StudentDeadlines (with DynamoDB Stream)")
except ClientError as e:
    print(f"❌ Error creating StudentDeadlines: {e}")

print("\n📦 Inserting sample assignment data...")

# Sample assignments
assignments = [
    {
        "assignment_id": str(uuid.uuid4()),
        "course_id": "CS101",
        "title": "Programming Assignment 1",
        "description": "Basic Python programming exercises",
        "due_date": "2025-01-25",
        "due_time": "23:59",
        "type": "assignment",
        "points": 100,
        "status": "active"
    },
    {
        "assignment_id": str(uuid.uuid4()),
        "course_id": "CS202",
        "title": "Data Structures Project",
        "description": "Implement binary search tree",
        "due_date": "2025-02-01",
        "due_time": "23:59",
        "type": "project",
        "points": 200,
        "status": "active"
    },
    {
        "assignment_id": str(uuid.uuid4()),
        "course_id": "AI301",
        "title": "Midterm Exam",
        "description": "Machine learning fundamentals",
        "due_date": "2025-02-15",
        "due_time": "14:00",
        "type": "exam",
        "points": 300,
        "status": "active"
    },
    {
        "assignment_id": str(uuid.uuid4()),
        "course_id": "CS101",
        "title": "Final Project",
        "description": "Build a complete application",
        "due_date": "2025-03-20",
        "due_time": "23:59",
        "type": "project",
        "points": 400,
        "status": "active"
    }
]

# Insert assignments
assignments_table = dynamodb.Table('Assignments')
for assignment in assignments:
    try:
        assignments_table.put_item(Item=assignment)
        print(f"✅ Added: {assignment['title']}")
    except ClientError as e:
        print(f"❌ Error inserting {assignment['title']}: {e}")

print("\n🎯 Creating personalized deadlines for students...")

# Create personalized deadlines for registered students
registrations_table = dynamodb.Table('Registrations')
deadlines_table = dynamodb.Table('StudentDeadlines')

try:
    # Get all registrations
    registrations = registrations_table.scan()
    
    for reg in registrations['Items']:
        student_id = reg['student_id']
        course_id = reg['course_id']
        
        # Find assignments for this course
        course_assignments = [a for a in assignments if a['course_id'] == course_id]
        
        for assignment in course_assignments:
            deadline_item = {
                "student_id": student_id,
                "deadline_date": assignment['due_date'],
                "assignment_id": assignment['assignment_id'],
                "course_id": course_id,
                "title": assignment['title'],
                "type": assignment['type'],
                "due_time": assignment['due_time'],
                "points": assignment['points'],
                "status": "pending"
            }
            
            deadlines_table.put_item(Item=deadline_item)
            print(f"✅ Added deadline for {student_id}: {assignment['title']}")
            
except ClientError as e:
    print(f"❌ Error creating personalized deadlines: {e}")

print("\n✨ Calendar tables setup complete!")
print("\n🔍 Verification - Sample deadlines for S1001:")

try:
    response = deadlines_table.query(
        KeyConditionExpression='student_id = :sid',
        ExpressionAttributeValues={':sid': 'S1001'}
    )
    
    for item in response['Items']:
        print(f"   📅 {item['deadline_date']} - {item['title']} ({item['type']})")
        
except ClientError as e:
    print(f"❌ Error querying deadlines: {e}")