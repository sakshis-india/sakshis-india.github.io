---
title: Creating a Custom VM-Series Firewall Image on Google Cloud Platform
date: 2024-07-17
tags: Cybersecurity, Cloud Security, Palo Alto Networks, VM-Series, Google Cloud Platform, GCP
description: A practical field guide to creating a custom Palo Alto Networks VM-Series firewall image on Google Cloud Platform when the required PAN-OS version is not available in the Marketplace.
---

## Introduction

When deploying Palo Alto Networks VM-Series firewalls on Google Cloud Platform (GCP), most teams rely on images published directly in the GCP Marketplace. These images are maintained by Palo Alto Networks and typically include base PAN-OS versions or minor releases with critical fixes.

However, real-world enterprise deployments often require:
- **Specific PAN-OS versions** that may not be available in the Marketplace
- **Preloaded Applications and Threats** content for faster deployment
- **Reusable golden images** for CI/CD pipelines or large-scale automation
- **Consistent baseline configurations** across multiple environments

In these scenarios, creating a custom VM-Series firewall image becomes necessary. This guide explains not just the technical steps, but also the reasoning and best practices behind each phase of the process.

## Understanding the Custom Image Use Case

### Why Not Just Upgrade After Deployment?

While you can certainly upgrade PAN-OS after deployment, custom images provide significant operational advantages:

**Benefits of Custom Images:**
- **Consistency:** Ensures all firewall instances start from an identical baseline
- **Speed:** Dramatically faster provisioning for autoscaling groups or instance templates
- **Reduced Risk:** Updates and configurations are baked into the base image, reducing post-deployment tasks
- **Automation-Friendly:** Image URIs integrate seamlessly with Terraform, Deployment Manager, and CI/CD pipelines
- **Version Control:** Maintain multiple image versions for different environments (dev, staging, production)

### Critical Licensing Requirement

**BYOL Only:** Creating custom images is supported exclusively for BYOL (Bring Your Own License) deployments.

**Important Notes:**
- Marketplace PAYG (pay-as-you-go) images cannot be converted into reusable custom images
- You must properly deactivate and reactivate licenses during the process
- Failure to deactivate the license before imaging will result in permanent license loss

## High-Level Workflow

The custom image creation process follows these essential phases:

1. **Deploy** a VM-Series firewall from the GCP Marketplace
2. **License** the firewall using BYOL
3. **Upgrade** PAN-OS software and dynamic content (Apps & Threats)
4. **Deactivate** the license (critical step to avoid license loss)
5. **Reset** private data to remove configurations and logs
6. **Stop** the VM instance
7. **Create** a custom image from the stopped VM disk

**Why This Order Matters:**
Each step is carefully sequenced to ensure the resulting image is:
- **Clean:** No residual logs, configurations, or private data
- **Re-licensable:** License can be activated on new instances
- **Compliant:** Follows Palo Alto Networks best practices
- **Safe for reuse:** Ready for production deployments

## Prerequisites and Planning

Before starting the custom image creation process, ensure you have the following:

**Required Access and Resources:**
1. **GCP Project** with appropriate IAM permissions:
   - Compute Instance Admin
   - Compute Image User
   - Service Account User
2. **VM-Series BYOL License** - Active and available for activation
3. **Network Design** - VPC and subnets for management and dataplane interfaces
4. **Target PAN-OS Version** - Know which version you need to deploy

**Planning Considerations:**
- Determine which Applications and Threats content version to include
- Decide if you need multiple custom images for different environments
- Plan for image naming conventions (e.g., `pa-vm-series-10-2-3-prod`)

**Critical Warning:**
> You **cannot** create a custom image from an existing, in-production firewall instance. Always start fresh from a GCP Marketplace deployment to ensure proper licensing compatibility and avoid disrupting live traffic.

## Step-by-Step: Creating a Custom VM-Series Image

### Step 1: Deploy the Firewall from GCP Marketplace

1. Navigate to **GCP Console → Marketplace**
2. Search for **"VM-Series Next-Generation Firewall from Palo Alto Networks"**
3. Click **Launch** and configure:
   - **Zone:** Select your preferred GCP zone
   - **Machine type:** Choose based on your throughput needs (e.g., n1-standard-4)
   - **Network interfaces:** Configure management and dataplane interfaces
   - **Boot disk:** Accept default settings
4. Click **Deploy**
5. Wait for deployment to complete (typically 3-5 minutes)

**Why Start from Marketplace:**
- Ensures proper VM metadata and licensing eligibility
- Includes necessary Google Cloud Platform integrations
- Provides a clean, supported starting point

### Step 2: Access and Activate the BYOL License

1. **Access the Firewall:**
   - Note the management interface external IP from GCP Console
   - Open a browser and navigate to `https://<management-ip>`
   - Log in with default credentials (admin/admin) or as configured

2. **Activate License:**
   - Navigate to **Device → Licenses**
   - Click **Activate feature using authorization code**
   - Enter your BYOL auth code
   - Click **OK**

3. **Wait for Reboot:**
   - The firewall will automatically reboot after license activation
   - This typically takes 2-3 minutes
   - Reconnect after reboot to continue

### Step 3: Upgrade PAN-OS Software

1. **Check for Updates:**
   - Navigate to **Device → Software**
   - Click **Check Now** to refresh available versions
   - Review available PAN-OS versions

2. **Download Desired Version:**
   - Locate your target PAN-OS version in the list
   - Click **Download** next to the version
   - Wait for download to complete (progress bar will show status)

3. **Install the Version:**
   - Click **Install** next to the downloaded version
   - Confirm the installation
   - Wait for installation and automatic reboot (5-10 minutes)

**If Your Desired Version Is Not Listed:**

Sometimes the specific version you need isn't available through the auto-update mechanism. In this case:

1. **Download from Support Portal:**
   - Log in to https://support.paloaltonetworks.com
   - Navigate to **Updates → Software Updates**
   - Filter by **PAN-OS** and **VM-Series**
   - Download the `.tar.gz` file to your local machine

2. **Upload to Firewall:**
   - In firewall GUI, go to **Device → Software**
   - Click **Upload PAN-OS Software Image**
   - Browse and select your downloaded `.tar.gz` file
   - Click **Upload** and wait for completion

3. **Install Uploaded Image:**
   - Click **Install** next to the newly uploaded version
   - Confirm and wait for reboot

### Step 4: Update Dynamic Content

Dynamic content updates (Applications and Threats, WildFire, etc.) are preserved after the private data reset, making them perfect for inclusion in your custom image.

1. **Navigate to Updates:**
   - Go to **Device → Dynamic Updates**

2. **Install Applications and Threats:**
   - Click **Check Now** to see latest versions
   - Locate **Applications and Threats**
   - Click **Download** for the latest version
   - Once downloaded, click **Install**
   - No reboot required

3. **Optional - Install Additional Content:**
   - WildFire updates (if applicable)
   - Antivirus updates
   - GlobalProtect client packages (if needed)

**Best Practice:** Always install the latest Applications and Threats content to ensure the image has current threat intelligence.

### Step 5: Deactivate the License (CRITICAL STEP)

**WARNING:** This is the most critical step in the entire process. Failure to properly deactivate the license will result in permanent license loss.

**Why Deactivation Matters:**
- Each VM-Series license can only be active on one instance at a time
- Creating an image without deactivating "burns" the license into the image
- New instances from that image will fail to activate
- The license becomes unusable and must be replaced

**Deactivation Process:**

1. **Initiate Deactivation:**
   - Navigate to **Device → Licenses**
   - Under **License Management** section, click **Deactivate VM**
   - Select **Complete Manually** (recommended for image creation)

2. **Export License Token:**
   - The firewall generates a deactivation token
   - Click **Export** to download the token file
   - Save this file securely (you'll need it in the next step)

3. **Complete Deactivation in Support Portal:**
   - Log in to https://support.paloaltonetworks.com
   - Navigate to **Assets → VM-Series Auth-Codes**
   - Click **Deactivate License(s)**
   - Upload the token file you exported
   - Confirm deactivation

4. **Verify:**
   - The license status on the firewall should show as deactivated
   - The auth code is now available for reuse on future instances

**Troubleshooting:**
If the manual deactivation fails, you can use the automatic option, but ensure your firewall has outbound internet access to Palo Alto Networks licensing servers.

### Step 6: Perform a Private Data Reset

A private data reset is essential for creating a clean, reusable image. It removes sensitive data while preserving the PAN-OS software and content updates.

**What Gets Removed:**
- All logs (traffic, threat, system, etc.)
- Running configuration
- Management interface settings
- API keys and passwords
- Any custom certificates or keys

**What Gets Preserved:**
- PAN-OS software version
- Applications and Threats content
- Dynamic updates
- System disks and base configuration

**Pre-Reset Preparation:**

1. **Establish CLI Session:**
   - SSH to the firewall: `ssh admin@<management-ip>`
   - Or use the web interface: **Device → Support → SSH CLI**
   - Keep this session active throughout the reset

2. **Remove SSH Keys from GCP (Important):**
   - Go to **GCP Console → Compute Engine → VM Instances**
   - Click on your firewall instance name
   - Click **Edit** at the top
   - Scroll to **SSH Keys** section
   - Click the **X** next to each SSH key to remove them
   - Click **Save** at the bottom
   - This prevents SSH key persistence in the image

**Execute the Reset:**

In the CLI session, run:
```bash
request system private-data-reset
```

When prompted with:
```
Private-data will be deleted and the system will reboot. Continue? (y or n)
```

Type `y` and press Enter.

**What Happens Next:**
- The firewall will begin the reset process (30-60 seconds)
- It will automatically reboot
- Upon reboot, it will have factory default configuration
- Management interface will be set to DHCP
- Default credentials will be admin/admin

**Wait Time:** Allow 3-5 minutes for the reset and reboot to complete.

### Step 7: Stop the Firewall VM

Once the firewall has rebooted after the private data reset, you need to stop it before creating the image.

1. **Navigate to Compute Engine:**
   - In GCP Console, go to **Compute Engine → VM Instances**

2. **Stop the Instance:**
   - Select your firewall VM instance (checkbox)
   - Click **STOP** at the top of the page
   - Confirm the stop action

3. **Verify Status:**
   - Wait for the status to change from "Stopping" to "Stopped"
   - This usually takes 30-60 seconds

**Why Stop the VM:**
- GCP requires VMs to be stopped before creating an image from their disks
- Ensures data consistency and prevents potential corruption
- Allows GCP to safely snapshot the boot disk

### Step 8: Create the Custom Image

Now that the firewall is stopped, you can create a custom image from its boot disk.

1. **Navigate to Images:**
   - Go to **Compute Engine → Images** in GCP Console
   - Click **Create Image** at the top

2. **Configure Image Settings:**

   **Name:** Enter a descriptive name
   - Example: `pa-vm-series-10-2-3-byol`
   - Use lowercase, hyphens only
   - Include version number for easy identification

   **Source:**
   - **Source type:** Select **Disk**
   - **Source disk:** Choose your stopped VM-Series firewall's boot disk from the dropdown

   **Encryption:**
   - Select **Google-managed encryption key** (recommended)
   - Or use a customer-managed key if required by your security policy

   **Location:**
   - Choose **Multi-regional** for broader availability
   - Or select specific regions if needed

3. **Optional - Add Labels:**
   - Add labels for organization (e.g., `environment: production`, `version: 10-2-3`)

4. **Create the Image:**
   - Review all settings
   - Click **Create** at the bottom
   - Image creation typically takes 5-10 minutes depending on disk size

5. **Monitor Progress:**
   - You'll see the image in the Images list with status "Pending"
   - Once complete, status changes to "Ready"

### Optional: Capture Image URI for Automation

For Infrastructure as Code (IaC) workflows, you'll need the image's self-link URI.

**Get the Image URI:**

1. **Click on the Image Name** in the Images list
2. **Click "Equivalent REST"** or "Equivalent command line" at the top
3. **Copy the selfLink value**

**Example URI:**
```
projects/my-project/global/images/pa-vm-series-10-2-3-byol
```

**Full Resource Path:**
```
https://www.googleapis.com/compute/v1/projects/my-project/global/images/pa-vm-series-10-2-3-byol
```

**Usage in Terraform:**
```hcl
resource "google_compute_instance" "firewall" {
  name         = "pa-vm-firewall"
  machine_type = "n1-standard-4"

  boot_disk {
    initialize_params {
      image = "projects/my-project/global/images/pa-vm-series-10-2-3-byol"
    }
  }
  # ... rest of configuration
}
```

**Usage in Deployment Manager:**
```yaml
resources:
- name: pa-vm-firewall
  type: compute.v1.instance
  properties:
    disks:
    - initializeParams:
        sourceImage: projects/my-project/global/images/pa-vm-series-10-2-3-byol
```

This URI integration enables fully automated, repeatable firewall deployments across your cloud infrastructure.

## Key Takeaways and Best Practices

**Essential Points to Remember:**

1. **License Management is Critical**
   - Always deactivate the license before creating the image
   - Failure to do so results in permanent license loss
   - Keep detailed records of which auth codes are used for which images

2. **Custom Images Enable Scale**
   - Dramatically faster deployment times (minutes vs hours)
   - Consistent configuration baseline across all instances
   - Perfect for autoscaling groups and dynamic environments

3. **Private Data Reset Preserves What Matters**
   - Software versions and content updates remain intact
   - Logs and configurations are removed for security
   - Results in a clean, production-ready image

4. **Automation Benefits**
   - Image URIs integrate seamlessly with IaC tools
   - Terraform, Deployment Manager, and Ansible workflows are simplified
   - Version control your infrastructure by managing image versions

**Common Pitfalls to Avoid:**

- **Skipping license deactivation** - Leads to unusable licenses
- **Forgetting SSH key removal** - Security risk if keys persist in the image
- **Not documenting image versions** - Causes confusion in multi-environment setups
- **Creating images from production firewalls** - Can disrupt live traffic and licensing

**When to Create New Custom Images:**

- Major PAN-OS version upgrades
- Quarterly content updates for Apps & Threats
- When adding new dynamic content (e.g., IoT Security)
- Before large-scale deployments or infrastructure refreshes

Understanding these principles helps prevent costly licensing mistakes and ensures secure, scalable cloud firewall deployments. From my experience managing VM-Series deployments across multiple cloud environments, taking the time to properly create and maintain custom images pays dividends in operational efficiency and reduced deployment times.

## Reference & Acknowledgment

This post is based on official Palo Alto Networks documentation that I worked on and helped publish as part of my professional role.

**Original Documentation:**  
Create a Custom VM-Series Firewall Image for Google Cloud Platform  
https://docs.paloaltonetworks.com/vm-series/10-1/vm-series-deployment/set-up-the-vm-series-firewall-on-google-cloud-platform/create-a-custom-vm-series-firewall-image-for-google-cloud-platform

This article reflects my personal explanation and practical experience working with VM-Series firewalls in cloud environments.

---

*— Sakshi Sharma*  
*Cybersecurity | Cloud Network Engineering*
